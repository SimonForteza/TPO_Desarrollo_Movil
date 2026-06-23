package com.example.backend.multas.dto;

import jakarta.validation.constraints.NotNull;

public record PagarMultaRequest(
        @NotNull(message = "medioPagoId is required") Long medioPagoId
) {}
