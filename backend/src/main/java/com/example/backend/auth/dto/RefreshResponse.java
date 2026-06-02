package com.example.backend.auth.dto;

public record RefreshResponse(
        String accessToken,
        String refreshToken
) {}
