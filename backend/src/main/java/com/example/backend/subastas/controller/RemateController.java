package com.example.backend.subastas.controller;

import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.subastas.dto.RemateEstadoResponse;
import com.example.backend.subastas.service.RemateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Estado del remate en vivo. El cliente hace polling de este endpoint: muestra el lote actual,
 * la cuenta regresiva (calculada server-side) y los lotes ya vendidos con su monto. La consulta
 * además dispara el martillo del lote actual si su tiempo venció (cierre lazy idempotente).
 */
@RestController
@RequestMapping("/subastas/{subastaId}")
public class RemateController {

    private final RemateService remateService;

    public RemateController(RemateService remateService) {
        this.remateService = remateService;
    }

    @GetMapping("/remate")
    public ResponseEntity<ApiResponse<RemateEstadoResponse>> remate(@PathVariable Integer subastaId) {
        RemateEstadoResponse result = remateService.estado(subastaId);
        return ResponseEntity.ok(ApiResponse.ok("Auction live state", result));
    }
}
