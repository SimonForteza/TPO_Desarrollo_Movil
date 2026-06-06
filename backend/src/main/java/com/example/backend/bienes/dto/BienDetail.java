package com.example.backend.bienes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BienDetail(
        Long id,
        String estado,
        String descripcionCatalogo,
        String descripcionCompleta,
        List<String> fotosBase64,
        String ubicacionDeposito,
        BigDecimal precioBasePropuesto,
        BigDecimal comisionPropuesta,
        SeguroSummary seguro,
        LocalDateTime creadaEn
) {}
