package com.example.backend.bienes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Datos opcionales que el admin puede fijar al aprobar un bien. Si un campo viene nulo,
 * se conserva el valor actual del bien.
 */
public record AprobarBienRequest(
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal precioBasePropuesto,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal comisionPropuesta,
        @Size(max = 255) String ubicacionDeposito
) {}
