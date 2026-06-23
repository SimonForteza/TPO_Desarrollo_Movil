package com.example.backend.multas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MultaDetail(
        Long id,
        Long compraId,
        BigDecimal importe,
        String estado,
        String motivo,
        Integer subastaId,
        String subastaTitulo,
        LocalDateTime venceEn,
        Long horasRestantes
) {}
