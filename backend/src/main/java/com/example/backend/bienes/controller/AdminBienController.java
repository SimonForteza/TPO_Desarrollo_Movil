package com.example.backend.bienes.controller;

import com.example.backend.bienes.dto.AprobarBienRequest;
import com.example.backend.bienes.dto.BienDetail;
import com.example.backend.bienes.dto.BienListItem;
import com.example.backend.bienes.dto.RechazarBienRequest;
import com.example.backend.bienes.service.AdminBienService;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints administrativos de bienes en consignación, pensados para Swagger/Postman.
 * Requieren autenticación (caen bajo anyRequest().authenticated()); no hay rol admin dedicado.
 */
@RestController
@RequestMapping("/admin/bienes")
public class AdminBienController {

    private final AdminBienService adminBienService;

    public AdminBienController(AdminBienService adminBienService) {
        this.adminBienService = adminBienService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<BienListItem>>> listar(
            @RequestParam(defaultValue = EstadoBien.PENDIENTE_REVISION) String estado,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<BienListItem> result = adminBienService.listarPorEstado(estado, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Consignments retrieved", result));
    }

    @GetMapping("/aprobados-disponibles")
    public ResponseEntity<ApiResponse<PagedResponse<BienListItem>>> aprobadosDisponibles(
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<BienListItem> result = adminBienService.listarAprobadosDisponibles(pageable);
        return ResponseEntity.ok(ApiResponse.ok("Available approved consignments retrieved", result));
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<ApiResponse<BienDetail>> aprobar(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) AprobarBienRequest req) {
        BienDetail result = adminBienService.aprobar(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Consignment approved", result));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<ApiResponse<BienDetail>> rechazar(
            @PathVariable Long id,
            @Valid @RequestBody RechazarBienRequest req) {
        BienDetail result = adminBienService.rechazar(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Consignment rejected", result));
    }
}
