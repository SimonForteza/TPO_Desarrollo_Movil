package com.example.backend.notificaciones.dto;

import java.time.LocalDateTime;

public record NotificacionResponse(
        Long id,
        String tipo,
        String titulo,
        String mensaje,
        boolean leida,
        LocalDateTime fecha,
        String entidadTipo,
        Long entidadId
) {}
