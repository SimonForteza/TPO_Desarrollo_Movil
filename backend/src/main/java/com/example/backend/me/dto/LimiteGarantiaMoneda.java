package com.example.backend.me.dto;

import java.math.BigDecimal;

/**
 * Límite del cheque-garantía para una moneda concreta. El usuario no puede comprar por encima de
 * lo que dejó como garantía: {@code disponible = garantia - utilizado}.
 */
public record LimiteGarantiaMoneda(
        String moneda,
        BigDecimal garantia,
        BigDecimal utilizado,
        BigDecimal disponible
) {}
