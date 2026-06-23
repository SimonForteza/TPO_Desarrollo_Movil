package com.example.backend.me.dto;

/**
 * Métrica de participación desglosada por categoría de subasta: cuántas subastas de esa categoría
 * participó el usuario y cuántas ganó.
 */
public record CategoriaMetric(
        String categoria,
        long participadas,
        long ganadas
) {}
