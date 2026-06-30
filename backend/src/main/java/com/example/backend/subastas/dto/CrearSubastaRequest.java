package com.example.backend.subastas.dto;

import jakarta.validation.constraints.NotBlank;

public record CrearSubastaRequest(
        @NotBlank String categoria,
        @NotBlank String moneda,
        String ubicacion,
        Integer diasHastaFecha
) {}
