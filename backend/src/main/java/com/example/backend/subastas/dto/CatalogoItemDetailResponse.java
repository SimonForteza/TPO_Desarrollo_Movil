package com.example.backend.subastas.dto;

import java.math.BigDecimal;

public record CatalogoItemDetailResponse(
        Integer id,
        String subastado,
        BigDecimal precioBase,
        BigDecimal comision,
        ProductoDetail producto
) {}
