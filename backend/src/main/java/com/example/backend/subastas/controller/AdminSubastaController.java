package com.example.backend.subastas.controller;

import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.subastas.dto.CierreSubastaResponse;
import com.example.backend.subastas.service.CierreSubastaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints administrativos de subastas, pensados para Swagger/Postman.
 * Requieren autenticación (caen bajo anyRequest().authenticated()); no hay rol admin dedicado.
 */
@RestController
@RequestMapping("/admin/subastas")
@Tag(name = "Admin auctions", description = "Auction lifecycle operations (closing) for staff")
public class AdminSubastaController {

    private final CierreSubastaService cierreSubastaService;

    public AdminSubastaController(CierreSubastaService cierreSubastaService) {
        this.cierreSubastaService = cierreSubastaService;
    }

    @PostMapping("/{id}/cerrar")
    @Operation(summary = "Close an auction: pick winners, generate purchases and register sales")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Auction closed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Auction not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Auction is not open")
    })
    public ResponseEntity<ApiResponse<CierreSubastaResponse>> cerrar(@PathVariable Integer id) {
        CierreSubastaResponse result = cierreSubastaService.cerrar(id);
        return ResponseEntity.ok(ApiResponse.ok("Auction closed", result));
    }
}
