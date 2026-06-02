package com.example.backend.auth.dto;

public record UsuarioMeResponse(
        Long id,
        String email,
        String nombre,
        String apellido,
        String documento,
        String estadoKyc,
        String categoria
) {}
