package com.example.backend.bienes.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SubastaAsignadaResumen(
        Integer id,
        LocalDate fecha,
        LocalTime hora,
        String estado,
        String categoria,
        String moneda,
        String ubicacion
) {}
