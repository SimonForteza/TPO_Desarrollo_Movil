package com.example.backend.me.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.compras.entity.Compra;
import com.example.backend.compras.repository.CompraRepository;
import com.example.backend.legacy.entity.Asistente;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.repository.ClienteRepository;
import com.example.backend.me.dto.ParticipacionItem;
import com.example.backend.me.dto.ParticipacionStats;
import com.example.backend.me.dto.ParticipacionesResponse;
import com.example.backend.multas.service.MultaService;
import com.example.backend.pujas.repository.PujoRepository;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.AsistenteRepository;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ParticipacionService {

    private final ClienteRepository clienteRepository;
    private final AsistenteRepository asistenteRepository;
    private final CompraRepository compraRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final MultaService multaService;

    public ParticipacionService(ClienteRepository clienteRepository,
                                AsistenteRepository asistenteRepository,
                                CompraRepository compraRepository,
                                ItemCatalogoRepository itemCatalogoRepository,
                                PujoRepository pujoRepository,
                                MultaService multaService) {
        this.clienteRepository = clienteRepository;
        this.asistenteRepository = asistenteRepository;
        this.compraRepository = compraRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujoRepository = pujoRepository;
        this.multaService = multaService;
    }

    /**
     * Historial de participaciones del usuario (frame "Mi historial"): una card por subasta a
     * la que se inscribió, con su resultado (ganada/perdida), importe y aviso de pago pendiente,
     * más las métricas de cabecera (participadas, ganadas, gastado).
     *
     * @param resultado todas | ganada | perdida | pujas (filtro de la lista; las stats no cambian)
     */
    public ParticipacionesResponse participaciones(Usuario usuario, String resultado) {
        // Asegura que las compras vencidas ya hayan derivado en multas antes de armar la vista.
        multaService.sincronizarVencidas(usuario.getId());

        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));

        List<Asistente> asistentes =
                asistenteRepository.findByClienteIdentificadorOrderBySubastaFechaDesc(cliente.getIdentificador());

        // Compras del usuario agrupadas por subasta (los lotes que ganó).
        Map<Integer, List<Compra>> comprasPorSubasta = new HashMap<>();
        for (Compra compra : compraRepository.findByUsuarioId(usuario.getId())) {
            Integer subastaId = subastaIdDeItem(compra.getItemId());
            if (subastaId != null) {
                comprasPorSubasta.computeIfAbsent(subastaId, k -> new ArrayList<>()).add(compra);
            }
        }

        long ganadasCount = comprasPorSubasta.values().stream().filter(l -> !l.isEmpty()).count();
        BigDecimal gastado = compraRepository.sumTotalPagadoByUsuario(usuario.getId());
        ParticipacionStats stats = new ParticipacionStats(asistentes.size(), ganadasCount,
                gastado != null ? gastado : BigDecimal.ZERO);

        List<ParticipacionItem> items = new ArrayList<>();
        for (Asistente a : asistentes) {
            Subasta subasta = a.getSubasta();
            if (subasta == null) continue;
            Integer subastaId = subasta.getIdentificador();
            List<Compra> compras = comprasPorSubasta.getOrDefault(subastaId, List.of());
            boolean gano = !compras.isEmpty();

            BigDecimal importe = null;
            Long compraId = null;
            boolean pagoPendiente = false;
            LocalDateTime pagarAntesDe = null;
            if (gano) {
                importe = compras.stream().map(Compra::getMontoFinal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                Compra pendiente = compras.stream()
                        .filter(c -> "pendiente".equals(c.getEstado()) || "impaga".equals(c.getEstado()))
                        .findFirst().orElse(null);
                pagoPendiente = pendiente != null;
                compraId = (pendiente != null ? pendiente : compras.get(0)).getId();
                pagarAntesDe = pendiente != null ? pendiente.getPagarAntesDe() : null;
            }

            String estado = gano ? "ganada" : "perdida";
            if (!matchesFiltro(resultado, estado, a)) continue;

            items.add(new ParticipacionItem(
                    subastaId,
                    tituloSubasta(subasta),
                    subasta.getFecha(),
                    importe,
                    estado,
                    compraId,
                    pagoPendiente,
                    pagarAntesDe,
                    horasRestantes(pagarAntesDe)));
        }

        return new ParticipacionesResponse(stats, items);
    }

    private boolean matchesFiltro(String resultado, String estado, Asistente a) {
        if (resultado == null || resultado.isBlank() || "todas".equalsIgnoreCase(resultado)) return true;
        if ("pujas".equalsIgnoreCase(resultado)) {
            return pujoRepository.existsByAsistenteIdentificador(a.getIdentificador());
        }
        return resultado.equalsIgnoreCase(estado); // ganada | perdida
    }

    private Integer subastaIdDeItem(Integer itemId) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId).orElse(null);
        if (item == null || item.getCatalogo() == null || item.getCatalogo().getSubasta() == null) return null;
        return item.getCatalogo().getSubasta().getIdentificador();
    }

    private String tituloSubasta(Subasta s) {
        String cat = s.getCategoria();
        return "Subasta #" + s.getIdentificador() + (cat != null && !cat.isBlank() ? " — " + cat : "");
    }

    private Long horasRestantes(LocalDateTime venceEn) {
        if (venceEn == null) return null;
        return Math.max(0, Duration.between(LocalDateTime.now(), venceEn).toHours());
    }
}
