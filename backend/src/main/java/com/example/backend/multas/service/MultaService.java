package com.example.backend.multas.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.compras.entity.Compra;
import com.example.backend.compras.repository.CompraRepository;
import com.example.backend.legacy.entity.Catalogo;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.multas.dto.MultaDetail;
import com.example.backend.multas.dto.MultaListItem;
import com.example.backend.multas.entity.Multa;
import com.example.backend.multas.repository.MultaRepository;
import com.example.backend.saldo.SaldoService;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ConflictException;
import com.example.backend.shared.exception.ForbiddenException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MultaService {

    private static final String MOTIVO_IMPAGO = "No pago de lote ganado";
    private static final BigDecimal PORCENTAJE_MULTA = new BigDecimal("0.10"); // 10% de lo ofertado
    private static final int HORAS_PARA_PAGAR_MULTA = 72;

    private final MultaRepository multaRepository;
    private final CompraRepository compraRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final MedioDePagoRepository medioDePagoRepository;
    private final SaldoService saldoService;

    public MultaService(MultaRepository multaRepository,
                        CompraRepository compraRepository,
                        ItemCatalogoRepository itemCatalogoRepository,
                        MedioDePagoRepository medioDePagoRepository,
                        SaldoService saldoService) {
        this.multaRepository = multaRepository;
        this.compraRepository = compraRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.medioDePagoRepository = medioDePagoRepository;
        this.saldoService = saldoService;
    }

    // ---------------------------------------------------------------- generación

    /**
     * Genera la multa por una compra impaga (10% del monto ofertado) y marca la compra como
     * {@code impaga}. Idempotente: si ya existe una multa para esa compra, no hace nada.
     */
    public Multa generarPorImpago(Compra compra) {
        if (multaRepository.existsByCompraId(compra.getId())) {
            return null;
        }
        Multa multa = new Multa();
        multa.setUsuarioId(compra.getUsuarioId());
        multa.setCompraId(compra.getId());
        multa.setImporte(compra.getMontoFinal().multiply(PORCENTAJE_MULTA).setScale(2, RoundingMode.HALF_UP));
        multa.setEstado("pendiente");
        multa.setVenceEn(LocalDateTime.now().plusHours(HORAS_PARA_PAGAR_MULTA));
        multaRepository.save(multa);

        compra.setEstado("impaga");
        compraRepository.save(compra);
        return multa;
    }

    /**
     * Genera la multa en una transacción independiente. Lo usa {@code CompraService.pagar}
     * cuando el saldo no alcanza: la multa debe persistir aunque la transacción del pago se
     * revierta (el pago termina lanzando un 422).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Multa generarPorImpagoTx(Long compraId) {
        Compra compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: " + compraId));
        return generarPorImpago(compra);
    }

    /**
     * Barrido lazy (no hay scheduler): genera multas por compras vencidas sin pago y pasa a
     * {@code judicial} las multas pendientes cuyo plazo de 72 hs ya venció. Conviene invocarlo
     * antes de leer/escribir cosas sensibles del usuario (historial, multas, inscripción, puja).
     */
    public void sincronizarVencidas(Long usuarioId) {
        LocalDateTime ahora = LocalDateTime.now();

        for (Compra compra : compraRepository.findVencidasSinPago(usuarioId, ahora)) {
            generarPorImpago(compra);
        }

        for (Multa multa : multaRepository.findByUsuarioIdAndEstado(usuarioId, "pendiente")) {
            if (multa.getVenceEn() != null && multa.getVenceEn().isBefore(ahora)) {
                multa.setEstado("judicial");
                multaRepository.save(multa);
            }
        }
    }

    // ---------------------------------------------------------------- lectura

    @Transactional(readOnly = true)
    public PagedResponse<MultaListItem> list(Usuario usuario, String estado, Pageable pageable) {
        sincronizarVencidas(usuario.getId());
        Page<Multa> page = (estado == null || estado.isBlank())
                ? multaRepository.findByUsuarioId(usuario.getId(), pageable)
                : multaRepository.findByUsuarioIdAndEstado(usuario.getId(), estado, pageable);
        List<MultaListItem> content = page.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public MultaDetail detail(Usuario usuario, Long id) {
        Multa multa = findOwned(usuario, id);
        Integer subastaId = null;
        String titulo = null;
        if (multa.getCompraId() != null) {
            Compra compra = compraRepository.findById(multa.getCompraId()).orElse(null);
            if (compra != null) {
                Subasta s = subastaDeItem(compra.getItemId());
                if (s != null) {
                    subastaId = s.getIdentificador();
                    titulo = tituloSubasta(compra.getItemId(), s);
                }
            }
        }
        return new MultaDetail(
                multa.getId(),
                multa.getCompraId(),
                multa.getImporte(),
                multa.getEstado(),
                MOTIVO_IMPAGO,
                subastaId,
                titulo,
                multa.getVenceEn(),
                horasRestantes(multa.getVenceEn()));
    }

    // ---------------------------------------------------------------- pago (mock)

    public MultaDetail pagar(Usuario usuario, Long id, Long medioPagoId) {
        Multa multa = findOwned(usuario, id);
        if ("pagada".equals(multa.getEstado())) {
            throw new ConflictException("Fine is already paid");
        }
        if ("judicial".equals(multa.getEstado())) {
            throw new BusinessRuleException("Fine moved to a judicial process and can no longer be paid in-app");
        }

        MedioDePago medio = medioDePagoRepository.findByIdAndUsuarioId(medioPagoId, usuario.getId())
                .orElseThrow(() -> new ForbiddenException("Payment method not found or not owned"));
        if (!"verificado".equals(medio.getEstado())) {
            throw new BusinessRuleException("Payment method is not verified");
        }
        if (!saldoService.alcanza(usuario.getId(), medioPagoId, multa.getImporte())) {
            throw new BusinessRuleException("Insufficient funds in the selected payment method");
        }

        saldoService.debitar(usuario.getId(), medioPagoId, multa.getImporte());
        multa.setEstado("pagada");
        multaRepository.save(multa);
        return detail(usuario, id);
    }

    // ---------------------------------------------------------------- helpers

    private Multa findOwned(Usuario usuario, Long id) {
        return multaRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found: " + id));
    }

    private MultaListItem toListItem(Multa m) {
        return new MultaListItem(
                m.getId(),
                m.getCompraId(),
                m.getImporte(),
                m.getEstado(),
                MOTIVO_IMPAGO,
                m.getVenceEn(),
                horasRestantes(m.getVenceEn()));
    }

    private Subasta subastaDeItem(Integer itemId) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId).orElse(null);
        if (item == null || item.getCatalogo() == null) return null;
        return item.getCatalogo().getSubasta();
    }

    private String tituloSubasta(Integer itemId, Subasta s) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId).orElse(null);
        Catalogo catalogo = item != null ? item.getCatalogo() : null;
        String desc = catalogo != null ? catalogo.getDescripcion() : null;
        if (desc == null || desc.isBlank()) desc = s.getCategoria();
        return "Subasta #" + s.getIdentificador() + (desc != null ? " — " + desc : "");
    }

    private Long horasRestantes(LocalDateTime venceEn) {
        if (venceEn == null) return null;
        long horas = Duration.between(LocalDateTime.now(), venceEn).toHours();
        return Math.max(0, horas);
    }
}
