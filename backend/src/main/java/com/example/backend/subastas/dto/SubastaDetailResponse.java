package com.example.backend.subastas.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SubastaDetailResponse(
        Integer id,
        LocalDate fecha,
        LocalTime hora,
        String estado,
        String categoria,
        String moneda,
        String ubicacion,
        Integer capacidadAsistentes,
        String tieneDeposito,
        String seguridadPropia,
        SubastadorSummary subastador
) {}
