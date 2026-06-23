package com.example.backend.notificaciones.service;

import com.example.backend.notificaciones.dto.NotificacionResponse;
import com.example.backend.notificaciones.entity.Notificacion;
import com.example.backend.notificaciones.repository.NotificacionRepository;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.ForbiddenException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    public void crear(Long usuarioId, String tipo, String titulo, String mensaje,
                      String entidadTipo, Long entidadId) {
        notificacionRepository.save(
                new Notificacion(usuarioId, tipo, titulo, mensaje, entidadTipo, entidadId));
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificacionResponse> listar(Long usuarioId, Boolean leida, Pageable pageable) {
        Page<Notificacion> page = (leida == null)
                ? notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuarioId, pageable)
                : notificacionRepository.findByUsuarioIdAndLeidaOrderByFechaDesc(usuarioId, leida, pageable);
        List<NotificacionResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public NotificacionResponse marcarLeida(Long id, Long usuarioId) {
        Notificacion notif = notificacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        if (!notif.getUsuarioId().equals(usuarioId)) {
            throw new ForbiddenException("Notification does not belong to this user");
        }
        notif.setLeida(true);
        return toResponse(notificacionRepository.save(notif));
    }

    public void marcarTodasLeidas(Long usuarioId) {
        notificacionRepository.marcarTodasLeidas(usuarioId);
    }

    public long contarNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    private NotificacionResponse toResponse(Notificacion n) {
        return new NotificacionResponse(n.getId(), n.getTipo(), n.getTitulo(), n.getMensaje(),
                n.isLeida(), n.getFecha(), n.getEntidadTipo(), n.getEntidadId());
    }
}
