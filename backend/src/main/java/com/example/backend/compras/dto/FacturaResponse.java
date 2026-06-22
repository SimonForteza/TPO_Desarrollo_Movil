package com.example.backend.compras.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FacturaResponse(
        Long compraId,
        String numeroFactura,
        LocalDateTime fecha,
        String descripcionProducto,
        BigDecimal montoFinal,
        BigDecimal comision,
        BigDecimal costoEnvio,
        BigDecimal total,
        String pdfUrl
) {}
