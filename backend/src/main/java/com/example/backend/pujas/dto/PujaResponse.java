package com.example.backend.pujas.dto;

import java.math.BigDecimal;

public record PujaResponse(
        Integer pujaId,
        Integer orden,
        BigDecimal importe,
        Integer itemId,
        Integer asistenteId,
        Integer numeroPostor
) {}
