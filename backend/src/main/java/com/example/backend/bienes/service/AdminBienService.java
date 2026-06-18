package com.example.backend.bienes.service;

import com.example.backend.bienes.dto.AprobarBienRequest;
import com.example.backend.bienes.dto.BienDetail;
import com.example.backend.bienes.dto.BienListItem;
import com.example.backend.bienes.dto.RechazarBienRequest;
import com.example.backend.bienes.entity.BienEnConsignacion;
import com.example.backend.bienes.repository.BienRepository;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public AdminBienService(BienRepository bienRepository, BienMapper bienMapper) {
        this.bienRepository = bienRepository;
        this.bienMapper = bienMapper;
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

        return bienMapper.toDetail(bien);
    }

    public BienDetail rechazar(Long id, RechazarBienRequest req) {
        BienEnConsignacion bien = findEnPendienteRevision(id);

        bien.setEstado(EstadoBien.RECHAZADO);
        bien.setMotivoRechazo(req.motivo());
        bienRepository.save(bien);

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

    private PagedResponse<BienListItem> toPagedResponse(Page<BienEnConsignacion> page) {
        List<BienListItem> content = page.getContent().stream()
                .map(bienMapper::toListItem)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
