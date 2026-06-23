package com.example.backend.mediosdepago.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MedioDePagoRequest(
        @NotBlank @Pattern(regexp = "cuenta|tarjeta|cheque") String tipo,
        @NotBlank @Pattern(regexp = "ARS|USD") String moneda,
        @NotBlank @Size(min = 4, max = 30) String numero,
        // Solo aplica a cheque (monto certificado). Cuenta y tarjeta usan un saldo por defecto.
        BigDecimal monto
) {}
