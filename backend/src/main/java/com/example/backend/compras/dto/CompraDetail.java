package com.example.backend.compras.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CompraDetail(
        Long id,
        Integer itemId,
        String descripcionProducto,
        BigDecimal montoFinal,
        BigDecimal comision,
        BigDecimal costoEnvio,
        boolean conSeguroEnvio,
        boolean retiraPersonalmente,
        BigDecimal total,
        String estado,
        LocalDateTime fecha,
        BigDecimal multaImporte  // null when no pending fine; included in payment total when present
) {}
