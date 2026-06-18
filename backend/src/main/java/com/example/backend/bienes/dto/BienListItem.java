package com.example.backend.bienes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BienListItem(
        Long id,
        Integer productoId,
        String estado,
        String descripcionCatalogo,
        String motivoRechazo,
        String ubicacionDeposito,
        BigDecimal precioBasePropuesto,
        BigDecimal comisionPropuesta,
        Integer subastaId,
        String primeraFotoBase64,
        LocalDateTime creadaEn
) {}
