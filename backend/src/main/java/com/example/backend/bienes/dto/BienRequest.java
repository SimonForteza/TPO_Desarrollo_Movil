package com.example.backend.bienes.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BienRequest(
        @NotBlank @Size(max = 500) String descripcion,
        @NotBlank @Size(max = 300) String descripcionCompleta,
        @NotNull @Size(min = 6) List<@NotBlank String> fotos,
        @AssertTrue boolean declaracionPropiedad,
        @AssertTrue boolean origenLicitoAcreditado
) {}
