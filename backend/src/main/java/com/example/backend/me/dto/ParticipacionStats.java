package com.example.backend.me.dto;

import java.math.BigDecimal;
import java.util.List;

public record ParticipacionStats(
        long participadas,
        long ganadas,
        BigDecimal gastado,
        BigDecimal ofertado,
        List<CategoriaMetric> porCategoria
) {}
