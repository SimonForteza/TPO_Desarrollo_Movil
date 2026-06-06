package com.example.backend.subastas.dto;

import java.time.LocalDateTime;

public record InscripcionResponse(
        Integer asistenteId,
        Integer numeroPostor,
        Integer subastaId,
        LocalDateTime fechaInscripcion
) {}
