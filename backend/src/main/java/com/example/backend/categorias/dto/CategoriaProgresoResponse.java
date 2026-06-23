package com.example.backend.categorias.dto;

/**
 * Categoría actual del usuario y los requisitos del tier siguiente, con las métricas vigentes.
 * El frontend arma la pista de "cómo mejorar" comparando lo actual contra los req*.
 *
 * @param actual          categoría vigente (comun|especial|plata|oro|platino)
 * @param siguiente       categoría inmediata superior, o null si ya es platino
 * @param tiposVerificados tipos distintos de medio verificados (0..3)
 * @param participadas    subastas en las que participó
 * @param ganadas         lotes ganados
 * @param reqTipos        tipos verificados que exige el tier siguiente (null si platino)
 * @param reqParticipadas participaciones que exige el tier siguiente (null si platino)
 * @param reqGanadas      ganadas que exige el tier siguiente (null si platino)
 */
public record CategoriaProgresoResponse(
        String actual,
        String siguiente,
        int tiposVerificados,
        int participadas,
        int ganadas,
        Integer reqTipos,
        Integer reqParticipadas,
        Integer reqGanadas
) {}
