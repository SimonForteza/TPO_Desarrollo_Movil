package com.example.backend.multas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MultaListItem(
        Long id,
        Long compraId,
        BigDecimal importe,
        String estado,
        String motivo,
        LocalDateTime venceEn,
        Long horasRestantes
) {}
