package com.example.backend.pujas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PujaRequest(
        @NotNull Integer itemId,
        @NotNull @DecimalMin("0.02") BigDecimal importe,
        @NotNull Long medioPagoId
) {}
