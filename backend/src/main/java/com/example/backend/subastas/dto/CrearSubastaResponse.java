package com.example.backend.subastas.dto;

import java.time.LocalDate;
import java.util.List;

public record CrearSubastaResponse(
        Integer subastaId,
        String categoria,
        String moneda,
        LocalDate fecha,
        String ubicacion,
        int totalItems,
        List<String> productos
) {}
