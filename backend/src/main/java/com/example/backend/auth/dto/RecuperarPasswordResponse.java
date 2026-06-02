package com.example.backend.auth.dto;

import java.time.LocalDateTime;

public record RecuperarPasswordResponse(
        String tokenRecuperacion,
        LocalDateTime expiraEn
) {}
