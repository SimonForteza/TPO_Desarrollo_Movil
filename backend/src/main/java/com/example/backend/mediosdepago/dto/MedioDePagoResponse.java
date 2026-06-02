package com.example.backend.mediosdepago.dto;

public record MedioDePagoResponse(
        Long id,
        String tipo,
        String moneda,
        String estado,
        String datosEnmascarados
) {}
