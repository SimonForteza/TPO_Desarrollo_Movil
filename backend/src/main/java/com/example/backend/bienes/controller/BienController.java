package com.example.backend.bienes.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.bienes.dto.*;
import com.example.backend.bienes.service.BienService;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bienes")
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
    public ResponseEntity<ApiResponse<BienDetail>> aceptarCondiciones(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @Valid @RequestBody AceptarCondicionesRequest req) {
        BienDetail result = bienService.aceptarCondiciones(usuario, id, req);
        return ResponseEntity.ok(ApiResponse.ok("Conditions updated", result));
    }

    @GetMapping("/{id}/ubicacion-poliza")
    public ResponseEntity<ApiResponse<UbicacionPolizaResponse>> ubicacionPoliza(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        UbicacionPolizaResponse result = bienService.ubicacionPoliza(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Location and policy retrieved", result));
    }
}
