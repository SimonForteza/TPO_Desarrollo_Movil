package com.example.backend.cuentascobro.dto;

public record CuentaCobroResponse(
        Long id,
        String banco,
        String pais,
        String numeroCuenta
) {}
