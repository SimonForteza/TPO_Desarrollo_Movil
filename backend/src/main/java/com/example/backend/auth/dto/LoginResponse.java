package com.example.backend.auth.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        UsuarioMeResponse usuario
) {}
