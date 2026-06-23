package com.example.backend.cuentascobro.dto;

import jakarta.validation.constraints.NotBlank;

public record CuentaCobroRequest(
        @NotBlank String banco,
        @NotBlank String pais,
        @NotBlank String numeroCuenta
) {}
