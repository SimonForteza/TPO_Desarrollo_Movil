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
        boolean conSeguroEnvio,
        boolean retiraPersonalmente,
        BigDecimal total,
        String pdfUrl
) {}
