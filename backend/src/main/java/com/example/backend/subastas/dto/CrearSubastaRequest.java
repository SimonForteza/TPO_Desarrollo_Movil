package com.example.backend.subastas.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CrearSubastaRequest(
        @NotBlank String categoria,
        @NotBlank String moneda,
        String ubicacion,
        Integer diasHastaFecha,
        List<Long> bienIds
) {}
