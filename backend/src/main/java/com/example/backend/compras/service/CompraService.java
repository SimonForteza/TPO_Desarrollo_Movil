package com.example.backend.compras.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.compras.dto.CompraDetail;
import com.example.backend.compras.dto.CompraListItem;
import com.example.backend.compras.dto.FacturaResponse;
import com.example.backend.compras.dto.PagarCompraRequest;
import com.example.backend.compras.entity.Compra;
import com.example.backend.compras.repository.CompraRepository;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.multas.service.MultaService;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CompraService {

    // Costo de envío mockeado (alineado con el wireframe "Envío estimado $2.500").
    private static final BigDecimal COSTO_ENVIO_MOCK = new BigDecimal("2500.00");

    private final CompraRepository compraRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final MedioDePagoRepository medioDePagoRepository;
    private final SaldoService saldoService;
    private final MultaService multaService;

    public CompraService(CompraRepository compraRepository,
                         ItemCatalogoRepository itemCatalogoRepository,
                         MedioDePagoRepository medioDePagoRepository,
                         SaldoService saldoService,
                         MultaService multaService) {
        this.compraRepository = compraRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.medioDePagoRepository = medioDePagoRepository;
        this.saldoService = saldoService;
        this.multaService = multaService;
    }

    /**
     * Pago diferido (mockeado) de un lote ganado. El ganador elige medio de pago y modalidad
     * de entrega. Si el saldo del medio no alcanza para el total, en lugar de pagar se genera
     * una multa (10% de lo ofertado) y se responde 422 (consigna L70). El retiro en persona
     * anula el costo de envío y la cobertura del seguro (consigna L66).
     */
    @Transactional
    public CompraDetail pagar(Usuario usuario, Long id, PagarCompraRequest req) {
        Compra compra = findOwned(usuario, id);
        if ("pagada".equals(compra.getEstado())) {
            throw new ConflictException("Purchase is already paid");
        }

        MedioDePago medio = medioDePagoRepository.findByIdAndUsuarioId(req.medioPagoId(), usuario.getId())
                .orElseThrow(() -> new ForbiddenException("Payment method not found or not owned"));
        if (!"verificado".equals(medio.getEstado())) {
            throw new BusinessRuleException("Payment method is not verified");
        }
        Subasta subasta = subastaDeItem(compra.getItemId());
        if (subasta != null && subasta.getMoneda() != null
                && !subasta.getMoneda().equals(medio.getMoneda())) {
            throw new BusinessRuleException("Payment method currency does not match auction currency");
        }

        BigDecimal costoEnvio = req.retiraPersonalmente() ? BigDecimal.ZERO : COSTO_ENVIO_MOCK;
        BigDecimal total = compra.getMontoFinal().add(compra.getComision()).add(costoEnvio);

        if (!saldoService.alcanza(usuario.getId(), req.medioPagoId(), total)) {
            // Sin fondos: se genera la multa en su propia transacción y se aborta el pago.
            multaService.generarPorImpagoTx(compra.getId());
            throw new BusinessRuleException(
                    "Insufficient funds: a fine (10% of the bid) was generated and must be paid before bidding again");
        }

        saldoService.debitar(usuario.getId(), req.medioPagoId(), total);
        compra.setCostoEnvio(costoEnvio);
        compra.setRetiraPersonalmente(req.retiraPersonalmente());
        compra.setConSeguroEnvio(!req.retiraPersonalmente() && req.conSeguroEnvio());
        compra.setEstado("pagada");
        compraRepository.save(compra);
        return detail(usuario, id);
    }

    private Subasta subastaDeItem(Integer itemId) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId).orElse(null);
        if (item == null || item.getCatalogo() == null) return null;
        return item.getCatalogo().getSubasta();
    }

    public PagedResponse<CompraListItem> list(Usuario usuario, Pageable pageable) {
        Page<Compra> page = compraRepository.findByUsuarioId(usuario.getId(), pageable);
        List<CompraListItem> content = page.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public CompraDetail detail(Usuario usuario, Long id) {
        Compra compra = findOwned(usuario, id);
        return new CompraDetail(
                compra.getId(),
                compra.getItemId(),
                descripcionProducto(compra.getItemId()),
                compra.getMontoFinal(),
                compra.getComision(),
                compra.getCostoEnvio(),
                compra.isConSeguroEnvio(),
                compra.isRetiraPersonalmente(),
                total(compra),
                compra.getEstado(),
                compra.getCreadaEn());
    }

    public FacturaResponse factura(Usuario usuario, Long id, String formato) {
        Compra compra = findOwned(usuario, id);
        // PDF mockeado: se devuelve una URL ficticia (sin integración real de generación).
        return new FacturaResponse(
                compra.getId(),
                "FAC-" + compra.getId(),
                compra.getCreadaEn(),
                descripcionProducto(compra.getItemId()),
                compra.getMontoFinal(),
                compra.getComision(),
                compra.getCostoEnvio(),
                total(compra),
                "https://cdn.subastas.com/facturas/" + compra.getId() + ".pdf");
    }

    private Compra findOwned(Usuario usuario, Long id) {
        return compraRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: " + id));
    }

    private CompraListItem toListItem(Compra compra) {
        return new CompraListItem(
                compra.getId(),
                compra.getItemId(),
                descripcionProducto(compra.getItemId()),
                compra.getMontoFinal(),
                compra.getComision(),
                compra.getCostoEnvio(),
                total(compra),
                compra.getEstado(),
                compra.getCreadaEn());
    }

    private BigDecimal total(Compra compra) {
        return compra.getMontoFinal().add(compra.getComision()).add(compra.getCostoEnvio());
    }

    private String descripcionProducto(Integer itemId) {
        return itemCatalogoRepository.findById(itemId)
                .map(ItemCatalogo::getProducto)
                .map(p -> p.getDescripcionCatalogo())
                .orElse(null);
    }
}
