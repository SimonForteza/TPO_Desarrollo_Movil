package com.example.backend.bienes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RechazarBienRequest(
        @NotBlank @Size(max = 300) String motivo
) {}
