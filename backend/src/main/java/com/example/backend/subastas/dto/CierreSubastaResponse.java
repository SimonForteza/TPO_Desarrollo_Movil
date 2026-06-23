package com.example.backend.subastas.dto;

public record CierreSubastaResponse(
        Integer subastaId,
        String estado,
        int totalItems,
        int comprasGeneradas,
        int itemsCompradosPorEmpresa
) {}
