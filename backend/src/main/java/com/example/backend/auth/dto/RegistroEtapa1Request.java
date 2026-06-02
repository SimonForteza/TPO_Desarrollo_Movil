package com.example.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistroEtapa1Request(
        @NotBlank String nombre,
        @NotBlank String apellido,
        @NotBlank String documento,
        @NotBlank String direccion,
        @NotNull Integer paisId,
        @NotBlank @Email String email,
        @NotBlank String fotoDniFrente,
        @NotBlank String fotoDniDorso
) {}
