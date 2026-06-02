package com.example.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompletarRegistroRequest(
        @NotBlank String tokenActivacion,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String passwordConfirmacion
) {}
