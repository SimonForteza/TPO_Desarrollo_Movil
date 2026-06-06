package com.example.backend.auth.dto;

import java.time.LocalDateTime;

public record KycEstadoResponse(
        boolean aprobado,
        String tokenActivacion,
        LocalDateTime expiraEn
) {}
