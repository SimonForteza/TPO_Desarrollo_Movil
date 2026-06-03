package com.example.backend.bienes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BienListItem(
        Long id,
        String estado,
        String descripcionCatalogo,
        String ubicacionDeposito,
        BigDecimal precioBasePropuesto,
        BigDecimal comisionPropuesta,
        LocalDateTime creadaEn
) {}
