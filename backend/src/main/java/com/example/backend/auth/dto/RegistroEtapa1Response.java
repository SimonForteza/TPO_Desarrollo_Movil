package com.example.backend.auth.dto;

import java.time.LocalDateTime;

public record RegistroEtapa1Response(
        Long usuarioId,
        String email,
        String tokenActivacion,
        LocalDateTime expiraEn
) {}
