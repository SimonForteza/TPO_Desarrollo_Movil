package com.example.backend.mediosdepago.dto;

import java.math.BigDecimal;

public record MedioDePagoResponse(
        Long id,
        String tipo,
        String moneda,
        String estado,
        String datosEnmascarados,
        BigDecimal saldo
) {}
