package com.example.backend.subastas.dto;

import java.util.List;

/**
 * Estado autoritativo del remate en vivo de una subasta. El reloj y el martillo viven en el
 * backend: todos los clientes (remotos) ven el mismo lote actual y la misma cuenta regresiva.
 *
 * {@code loteActualId} y {@code segundosRestantes} son null cuando ya se remataron todos los lotes
 * (subasta finalizada).
 */
public record RemateEstadoResponse(
        Integer subastaId,
        String estadoSubasta,
        Integer loteActualId,
        Integer segundosRestantes,
        Integer duracionRemate,
        List<RemateLote> lotes
) {}
