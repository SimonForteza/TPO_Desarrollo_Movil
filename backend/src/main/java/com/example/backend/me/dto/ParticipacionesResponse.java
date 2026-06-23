package com.example.backend.me.dto;

import java.util.List;

public record ParticipacionesResponse(
        ParticipacionStats stats,
        List<ParticipacionItem> items
) {}
