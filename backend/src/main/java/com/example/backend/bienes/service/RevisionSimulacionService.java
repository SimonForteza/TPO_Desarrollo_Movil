package com.example.backend.bienes.service;

import com.example.backend.bienes.entity.BienEnConsignacion;
import com.example.backend.bienes.repository.BienRepository;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.legacy.entity.Producto;
import com.example.backend.legacy.repository.ProductoRepository;
import com.example.backend.notificaciones.service.NotificacionService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class RevisionSimulacionService {

    private static final String SUCURSAL = "Sáenz Peña al 1500";

    private final BienRepository bienRepository;
    private final ProductoRepository productoRepository;
    private final NotificacionService notificacionService;

    public RevisionSimulacionService(BienRepository bienRepository,
                                     ProductoRepository productoRepository,
                                     NotificacionService notificacionService) {
        this.bienRepository = bienRepository;
        this.productoRepository = productoRepository;
        this.notificacionService = notificacionService;
    }

    /**
     * Inspección simulada (sin scheduler): a los 10 s de solicitar el bien se avisa al usuario
     * que debe acercar el producto a la sucursal para inspeccionarlo. No aprueba ni rechaza
     * automáticamente: la propuesta de precio se genera después, cuando el bien pasa a
     * {@code esperando_subasta} (ver {@code BienService.sincronizarPropuestas}).
     */
    @Async
    public void simularInspeccion(Long bienId) {
        try {
            Thread.sleep(10_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return;
        }

        BienEnConsignacion bien = bienRepository.findById(bienId).orElse(null);
        if (bien == null || !EstadoBien.PENDIENTE_REVISION.equals(bien.getEstado())) {
            return;
        }

        String nombre = productoRepository.findById(bien.getProductoId())
                .map(Producto::getDescripcionCatalogo)
                .orElse("tu producto");

        notificacionService.crear(bien.getUsuarioId(), "BIEN_EN_INSPECCION",
                "Inspección de tu producto",
                String.format("Queremos inspeccionar \"%s\". Acercalo a nuestra sucursal de %s.",
                        nombre, SUCURSAL),
                "BIEN", bien.getId());
    }
}
