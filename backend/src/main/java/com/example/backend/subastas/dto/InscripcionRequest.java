package com.example.backend.subastas.dto;

import jakarta.validation.constraints.NotNull;

public record InscripcionRequest(@NotNull Long medioPagoId) {}
