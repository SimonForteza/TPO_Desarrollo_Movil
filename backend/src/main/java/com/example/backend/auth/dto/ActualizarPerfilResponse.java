package com.example.backend.auth.dto;

public record ActualizarPerfilResponse(
        UsuarioMeResponse usuario,
        String accessToken,
        String refreshToken
) {}
