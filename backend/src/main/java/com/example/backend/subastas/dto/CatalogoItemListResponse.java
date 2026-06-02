package com.example.backend.subastas.dto;

import java.math.BigDecimal;

public record CatalogoItemListResponse(
        Integer id,
        String subastado,
        BigDecimal precioBase,
        ProductoSummary producto
) {}
