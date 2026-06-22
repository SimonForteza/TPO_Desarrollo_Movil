package com.example.backend.compras.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CompraListItem(
        Long id,
        Integer itemId,
        String descripcionProducto,
        BigDecimal montoFinal,
        BigDecimal comision,
        BigDecimal costoEnvio,
        BigDecimal total,
        String estado,
        LocalDateTime fecha
) {}
