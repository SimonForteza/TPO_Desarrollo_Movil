package com.example.backend.subastas.dto;

import java.util.List;

public record ProductoDetail(
        Integer id,
        String descripcionCatalogo,
        String descripcionCompletaUrl,
        List<String> fotosBase64
) {}
