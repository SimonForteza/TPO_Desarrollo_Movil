package com.example.backend.pujas.dto;

import java.math.BigDecimal;

public record PujaHistoryItem(
        Integer pujaId,
        Integer orden,
        BigDecimal importe,
        Integer itemId,
        String productoDescripcion,
        Integer asistenteId,
        Integer numeroPostor
) {}
