package com.example.backend.me.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ParticipacionItem(
        Integer subastaId,
        String titulo,
        LocalDate fecha,
        BigDecimal importe,      // null si no ganó
        String estado,           // ganada | perdida
        Long compraId,           // para navegar al pago / detalle de compra
        boolean pagoPendiente,
        LocalDateTime pagarAntesDe,
        Long horasRestantesPago
) {}
