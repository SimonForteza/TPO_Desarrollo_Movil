package com.example.backend.bienes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BienDetail(
        Long id,
        Integer productoId,
        String estado,
        String descripcionCatalogo,
        String descripcionCompleta,
        List<String> fotosBase64,
        String motivoRechazo,
        String ubicacionDeposito,
        BigDecimal precioBasePropuesto,
        BigDecimal comisionPropuesta,
        BigDecimal gastosDevolucion,
        SeguroSummary seguro,
        Integer subastaId,
        SubastaAsignadaResumen subastaAsignada,
        LocalDateTime creadaEn
) {}
