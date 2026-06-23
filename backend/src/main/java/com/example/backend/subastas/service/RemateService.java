package com.example.backend.subastas.service;

import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Producto;
import com.example.backend.legacy.entity.Pujo;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.pujas.repository.PujoRepository;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.dto.RemateEstadoResponse;
import com.example.backend.subastas.dto.RemateLote;
import com.example.backend.subastas.entity.LoteRemate;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import com.example.backend.subastas.repository.LoteRemateRepository;
import com.example.backend.subastas.repository.SubastaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Motor del remate en vivo, autoritativo en el backend. Modela una subasta secuencial:
 * se remata un lote a la vez (el primer ítem no subastado, en orden de catálogo) y se pasa al
 * siguiente recién cuando el actual se vende. El reloj (deadline) vive en {@link LoteRemate};
 * cuando vence, el lote se martilla automáticamente (cierre lazy idempotente al consultar el
 * estado). Cada puja nueva reinicia el deadline.
 */
@Service
@Transactional
public class RemateService {

    /** Duración de la cuenta regresiva de cada lote; se reinicia con cada puja nueva. */
    public static final int DURACION_SEG = 60;

    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final LoteRemateRepository loteRemateRepository;
    private final CierreSubastaService cierreSubastaService;

    public RemateService(SubastaRepository subastaRepository,
                         ItemCatalogoRepository itemCatalogoRepository,
                         PujoRepository pujoRepository,
                         LoteRemateRepository loteRemateRepository,
                         CierreSubastaService cierreSubastaService) {
        this.subastaRepository = subastaRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujoRepository = pujoRepository;
        this.loteRemateRepository = loteRemateRepository;
        this.cierreSubastaService = cierreSubastaService;
    }

    /**
     * Devuelve el estado vivo del remate. Antes de responder, martilla el lote actual si su
     * deadline ya venció y arranca el reloj del siguiente. Idempotente y seguro de invocar
     * en cada poll de los clientes.
     */
    public RemateEstadoResponse estado(Integer subastaId) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));

        List<ItemCatalogo> items = itemsOrdenados(subastaId);

        boolean abierta = "abierta".equals(subasta.getEstado());
        if (abierta) {
            avanzarRemate(subasta, items);
        }

        // Solo hay lote en remate si la subasta está abierta; si está cerrada se muestra el resumen.
        ItemCatalogo actual = abierta ? primerPendiente(items) : null;

        Integer loteActualId = null;
        Integer segundosRestantes = null;
        if (actual != null) {
            LoteRemate timer = loteRemateRepository.findByItemId(actual.getIdentificador()).orElse(null);
            if (timer != null) {
                long restantes = Duration.between(LocalDateTime.now(), timer.getDeadline()).getSeconds();
                segundosRestantes = (int) Math.max(0, restantes);
            }
            loteActualId = actual.getIdentificador();
        } else {
            cierreSubastaService.marcarCerradaSiCorresponde(subasta);
        }

        List<RemateLote> lotes = construirLotes(items, loteActualId);

        return new RemateEstadoResponse(
                subastaId, subasta.getEstado(), loteActualId, segundosRestantes,
                DURACION_SEG, lotes);
    }

    /**
     * Reinicia la cuenta regresiva del lote tras una puja válida ("a la una... a las dos..."),
     * creando el reloj si todavía no existía. Lo llama PujaService al registrar una puja.
     */
    public void reiniciarReloj(Integer subastaId, Integer itemId) {
        LoteRemate timer = loteRemateRepository.findByItemId(itemId)
                .orElseGet(() -> new LoteRemate(subastaId, itemId, null));
        timer.setDeadline(LocalDateTime.now().plusSeconds(DURACION_SEG));
        loteRemateRepository.save(timer);
    }

    /** Id del lote actualmente en remate (primer ítem no subastado), o null si no queda ninguno. */
    @Transactional(readOnly = true)
    public Integer loteActualId(Integer subastaId) {
        ItemCatalogo actual = primerPendiente(itemsOrdenados(subastaId));
        return actual != null ? actual.getIdentificador() : null;
    }

    /**
     * Indica si se puede pujar el lote: debe ser el lote actual en remate y su tiempo no debe
     * haber vencido. Un lote recién salido (aún sin reloj) se considera vigente.
     */
    @Transactional(readOnly = true)
    public boolean loteVigente(Integer subastaId, Integer itemId) {
        if (!itemId.equals(loteActualId(subastaId))) {
            return false;
        }
        LoteRemate timer = loteRemateRepository.findByItemId(itemId).orElse(null);
        return timer == null || timer.getDeadline().isAfter(LocalDateTime.now());
    }

    // --- internos ---

    /**
     * Martilla el lote actual si su reloj venció, y arranca el reloj del siguiente. Cierra como
     * mucho un lote por invocación: cada lote nuevo recibe su ventana completa desde que se observa
     * por primera vez (no se "saltean" lotes por falta de polling).
     */
    private void avanzarRemate(Subasta subasta, List<ItemCatalogo> items) {
        while (true) {
            ItemCatalogo actual = primerPendiente(items);
            if (actual == null) {
                cierreSubastaService.marcarCerradaSiCorresponde(subasta);
                return;
            }
            LoteRemate timer = loteRemateRepository.findByItemId(actual.getIdentificador()).orElse(null);
            if (timer == null) {
                // Arranca el reloj de este lote recién salido a remate.
                loteRemateRepository.save(new LoteRemate(subasta.getIdentificador(),
                        actual.getIdentificador(), LocalDateTime.now().plusSeconds(DURACION_SEG)));
                return;
            }
            if (timer.getDeadline().isAfter(LocalDateTime.now())) {
                return; // sigue corriendo
            }
            // Venció el deadline → cae el martillo. cerrarItem marca el ítem subastado en este
            // mismo contexto, así la próxima vuelta toma el lote siguiente.
            cierreSubastaService.cerrarItem(subasta, actual);
        }
    }

    private List<ItemCatalogo> itemsOrdenados(Integer subastaId) {
        return itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId).stream()
                .sorted(Comparator.comparing(ItemCatalogo::getIdentificador))
                .toList();
    }

    private ItemCatalogo primerPendiente(List<ItemCatalogo> items) {
        return items.stream()
                .filter(i -> !"si".equals(i.getSubastado()))
                .findFirst()
                .orElse(null);
    }

    private List<RemateLote> construirLotes(List<ItemCatalogo> items, Integer loteActualId) {
        return java.util.stream.IntStream.range(0, items.size())
                .mapToObj(i -> {
                    ItemCatalogo item = items.get(i);
                    int numeroLote = i + 1;
                    Producto producto = item.getProducto();
                    String descripcion = producto != null ? producto.getDescripcionCatalogo() : null;
                    List<Pujo> pujos = pujoRepository.findByItemIdentificador(item.getIdentificador());

                    if ("si".equals(item.getSubastado())) {
                        if (pujos.isEmpty()) {
                            return new RemateLote(item.getIdentificador(), numeroLote, descripcion,
                                    item.getPrecioBase(), "sin_ofertas", item.getPrecioBase(), null);
                        }
                        Pujo ganadora = pujos.stream()
                                .filter(p -> "si".equals(p.getGanador()))
                                .findFirst()
                                .orElseGet(() -> mejorPuja(pujos));
                        return new RemateLote(item.getIdentificador(), numeroLote, descripcion,
                                item.getPrecioBase(), "vendido", ganadora.getImporte(),
                                ganadora.getAsistente().getNumeroPostor());
                    }

                    if (item.getIdentificador().equals(loteActualId)) {
                        Pujo best = mejorPuja(pujos);
                        BigDecimal monto = best != null ? best.getImporte() : null;
                        Integer lider = best != null ? best.getAsistente().getNumeroPostor() : null;
                        return new RemateLote(item.getIdentificador(), numeroLote, descripcion,
                                item.getPrecioBase(), "en_remate", monto, lider);
                    }

                    return new RemateLote(item.getIdentificador(), numeroLote, descripcion,
                            item.getPrecioBase(), "pendiente", null, null);
                })
                .toList();
    }

    private Pujo mejorPuja(List<Pujo> pujos) {
        return pujos.stream().max(Comparator.comparing(Pujo::getImporte)).orElse(null);
    }
}
