package com.example.backend.bienes.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.bienes.dto.*;
import com.example.backend.bienes.service.BienService;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bienes")
@Tag(name = "Bienes", description = "Consignment management for asset owners")
public class BienController {

    private final BienService bienService;

    public BienController(BienService bienService) {
        this.bienService = bienService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<BienListItem>>> list(
            @AuthenticationPrincipal Usuario usuario,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<BienListItem> result = bienService.list(usuario, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Consignments retrieved", result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BienDetail>> solicitar(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody BienRequest req) {
        BienDetail result = bienService.solicitar(usuario, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Consignment requested", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BienDetail>> detail(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        BienDetail result = bienService.detail(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Consignment retrieved", result));
    }

    @PutMapping("/{id}/aceptar-condiciones")
    @Operation(summary = "Accept the proposed base price and commission (transitions to 'asignado')")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Conditions accepted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Consignment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Not in 'aprobado' state or missing price/commission")
    })
    public ResponseEntity<ApiResponse<BienDetail>> aceptarCondiciones(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        BienDetail result = bienService.aceptarCondiciones(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Conditions accepted", result));
    }

    @PutMapping("/{id}/rechazar-condiciones")
    @Operation(summary = "Reject the proposed conditions — good is returned with charges (5% of base price)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Conditions rejected, good returned with charges"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Consignment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Not in 'aprobado' state or missing price/commission")
    })
    public ResponseEntity<ApiResponse<BienDetail>> rechazarCondiciones(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        BienDetail result = bienService.rechazarCondiciones(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Conditions rejected, good will be returned with charges", result));
    }

    @GetMapping("/{id}/ubicacion-poliza")
    @Operation(summary = "Get deposit location and insurance policy (available once 'aprobado')")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Location and policy retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found or location not yet available")
    })
    public ResponseEntity<ApiResponse<UbicacionPolizaResponse>> ubicacionPoliza(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        UbicacionPolizaResponse result = bienService.ubicacionPoliza(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Location and policy retrieved", result));
    }
}
