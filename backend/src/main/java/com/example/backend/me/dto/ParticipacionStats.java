package com.example.backend.me.dto;

import java.math.BigDecimal;

public record ParticipacionStats(
        long participadas,
        long ganadas,
        BigDecimal gastado
) {}
