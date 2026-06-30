package com.example.backend.bienes.service;

import com.example.backend.bienes.dto.AprobarBienRequest;
import com.example.backend.bienes.dto.BienDetail;
import com.example.backend.bienes.dto.BienListItem;
import com.example.backend.bienes.dto.RechazarBienRequest;
import com.example.backend.bienes.entity.BienEnConsignacion;
import com.example.backend.bienes.repository.BienRepository;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.legacy.entity.Catalogo;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Producto;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.repository.ProductoRepository;
import com.example.backend.notificaciones.service.NotificacionService;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.CatalogoRepository;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import com.example.backend.subastas.repository.SubastaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Operaciones administrativas sobre bienes en consignación (NO filtran por usuario).
 * Pensado para usarse desde Swagger/Postman. Fase 1: revisión, aprobación y rechazo.
 */
@Service
@Transactional
public class AdminBienService {

    private final BienRepository bienRepository;
    private final BienMapper bienMapper;
    private final NotificacionService notificacionService;
    private final ProductoRepository productoRepository;
    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;

    public AdminBienService(BienRepository bienRepository, BienMapper bienMapper,
                            NotificacionService notificacionService,
                            ProductoRepository productoRepository,
                            SubastaRepository subastaRepository,
                            CatalogoRepository catalogoRepository,
                            ItemCatalogoRepository itemCatalogoRepository) {
        this.bienRepository = bienRepository;
        this.bienMapper = bienMapper;
        this.notificacionService = notificacionService;
        this.productoRepository = productoRepository;
        this.subastaRepository = subastaRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<BienListItem> listarPorEstado(String estado, Pageable pageable) {
        Page<BienEnConsignacion> page = bienRepository.findByEstado(estado, pageable);
        return toPagedResponse(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BienListItem> listarAprobadosDisponibles(Pageable pageable) {
        Page<BienEnConsignacion> page =
                bienRepository.findByEstadoAndSubastaIdIsNull(EstadoBien.APROBADO, pageable);
        return toPagedResponse(page);
    }

    public BienDetail aprobar(Long id, AprobarBienRequest req) {
        BienEnConsignacion bien = findEnPendienteRevision(id);

        if (req != null) {
            if (req.precioBasePropuesto() != null) {
                bien.setPrecioBasePropuesto(req.precioBasePropuesto());
            }
            if (req.comisionPropuesta() != null) {
                bien.setComisionPropuesta(req.comisionPropuesta());
            }
            if (req.ubicacionDeposito() != null) {
                bien.setUbicacionDeposito(req.ubicacionDeposito());
            }
        }

        bien.setEstado(EstadoBien.APROBADO);
        bien.setMotivoRechazo(null);
        bienRepository.save(bien);

        String nombreBien = nombreProducto(bien.getProductoId());
        notificacionService.crear(bien.getUsuarioId(), "BIEN_ACEPTADO",
                "Bien aceptado para consignación",
                String.format("Tu bien \"%s\" fue aceptado. Revisá las condiciones propuestas (precio base y comisión) en Mis Productos.",
                        nombreBien),
                "BIEN", bien.getId());

        return bienMapper.toDetail(bien);
    }

    public BienDetail asignar(Long bienId, Integer subastaId) {
        BienEnConsignacion bien = bienRepository.findById(bienId)
                .orElseThrow(() -> new ResourceNotFoundException("Consignment not found: " + bienId));

        boolean estadoValido = EstadoBien.APROBADO.equals(bien.getEstado())
                || EstadoBien.ASIGNADO.equals(bien.getEstado());
        if (!estadoValido) {
            throw new BusinessRuleException(
                    "Consignment must be in 'aprobado' or 'asignado' state (current: " + bien.getEstado() + ")");
        }
        if (bien.getSubastaId() != null) {
            throw new BusinessRuleException("Already assigned to auction " + bien.getSubastaId());
        }

        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));
        if (!"abierta".equals(subasta.getEstado())) {
            throw new BusinessRuleException("Auction is not open");
        }

        Catalogo catalogo = catalogoRepository.findBySubastaIdentificador(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("No catalog for auction: " + subastaId));

        Producto producto = productoRepository.findById(bien.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + bien.getProductoId()));

        BigDecimal precioBase = bien.getPrecioBasePropuesto() != null
                ? bien.getPrecioBasePropuesto() : new BigDecimal("1000.00");
        BigDecimal comision = bien.getComisionPropuesta() != null
                ? bien.getComisionPropuesta() : new BigDecimal("100.00");

        ItemCatalogo item = new ItemCatalogo();
        item.setCatalogo(catalogo);
        item.setProducto(producto);
        item.setPrecioBase(precioBase);
        item.setComision(comision);
        item.setSubastado("no");
        itemCatalogoRepository.save(item);

        bien.setEstado(EstadoBien.ASIGNADO);
        bien.setSubastaId(subastaId);
        bienRepository.save(bien);

        notificacionService.crear(bien.getUsuarioId(), "BIEN_ASIGNADO",
                "Tu bien fue asignado a una subasta",
                "Tu bien fue asignado a la Subasta #" + subastaId + ". ¡Participará en el próximo remate!",
                "BIEN", bien.getId());

        return bienMapper.toDetail(bien);
    }

    public BienDetail rechazar(Long id, RechazarBienRequest req) {
        BienEnConsignacion bien = findEnPendienteRevision(id);

        bien.setEstado(EstadoBien.RECHAZADO);
        bien.setMotivoRechazo(req.motivo());
        bienRepository.save(bien);

        String nombreBien = nombreProducto(bien.getProductoId());
        notificacionService.crear(bien.getUsuarioId(), "BIEN_RECHAZADO",
                "Bien rechazado",
                String.format("Tu bien \"%s\" fue rechazado. Motivo: %s",
                        nombreBien, req.motivo()),
                "BIEN", bien.getId());

        return bienMapper.toDetail(bien);
    }

    private BienEnConsignacion findEnPendienteRevision(Long id) {
        BienEnConsignacion bien = bienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consignment not found: " + id));
        if (!EstadoBien.PENDIENTE_REVISION.equals(bien.getEstado())) {
            throw new BusinessRuleException(
                    "Consignment must be in '" + EstadoBien.PENDIENTE_REVISION
                            + "' state (current: " + bien.getEstado() + ")");
        }
        return bien;
    }

    private String nombreProducto(Integer productoId) {
        if (productoId == null) return "Sin nombre";
        return productoRepository.findById(productoId)
                .map(Producto::getDescripcionCatalogo)
                .orElse("Bien #" + productoId);
    }

    private PagedResponse<BienListItem> toPagedResponse(Page<BienEnConsignacion> page) {
        List<BienListItem> content = page.getContent().stream()
                .map(bienMapper::toListItem)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
