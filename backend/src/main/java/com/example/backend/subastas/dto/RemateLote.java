package com.example.backend.subastas.dto;

import java.math.BigDecimal;

/**
 * Estado de un lote dentro del remate en vivo.
 *
 * {@code estado}:
 *  - "pendiente"  → todavía no salió a remate
 *  - "en_remate"  → es el lote actual sobre el que se puja
 *  - "vendido"    → martillado y adjudicado a un postor ({@code montoActual} = precio de venta)
 *  - "sin_ofertas"→ martillado sin pujas, adjudicado a la casa al precio base
 *
 * Para "en_remate", {@code montoActual} es la mejor oferta vigente (o null si nadie pujó aún)
 * y {@code numeroPostorLider} el postor que va ganando ({@code nombrePostorLider} su nombre).
 */
public record RemateLote(
        Integer itemId,
        Integer numeroLote,
        String descripcion,
        BigDecimal precioBase,
        String estado,
        BigDecimal montoActual,
        Integer numeroPostorLider,
        String nombrePostorLider
) {}
