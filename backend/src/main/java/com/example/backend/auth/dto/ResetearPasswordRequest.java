package com.example.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetearPasswordRequest(
        @NotBlank String tokenRecuperacion,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String passwordConfirmacion
) {}
