package com.example.backend.bienes.dto;

import jakarta.validation.constraints.NotNull;

public record AceptarCondicionesRequest(@NotNull Boolean acepta) {}
