package com.example.backend.compras.dto;

import jakarta.validation.constraints.NotNull;

public record PagarCompraRequest(
        @NotNull(message = "medioPagoId is required") Long medioPagoId,
        boolean retiraPersonalmente,
        boolean conSeguroEnvio
) {}
