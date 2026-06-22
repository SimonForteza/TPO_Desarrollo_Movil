package com.example.backend.subastas.dto;

import java.math.BigDecimal;

/**
 * Resultado de cerrar (martillar) un único lote. {@code vendido} = hubo postores y se
 * adjudicó al mejor; {@code sinOfertas} = nadie pujó y se adjudica a la casa al precio base.
 */
public record CierreLoteResultado(
        Integer itemId,
        boolean vendido,
        boolean sinOfertas,
        BigDecimal montoFinal,
        Integer numeroPostorGanador,
        boolean compraGenerada
) {}
