package com.example.backend.me.dto;

import java.util.List;

/**
 * Respuesta de {@code GET /me/limite-disponible}. Solo incluye las monedas en las que el usuario
 * tiene cheques certificados verificados; {@code tieneGarantia} es false si no declaró ninguno.
 */
public record LimiteDisponibleResponse(
        List<LimiteGarantiaMoneda> limites,
        boolean tieneGarantia
) {}
