package com.example.backend.subastas.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.subastas.dto.*;
import com.example.backend.subastas.service.InscripcionService;
import com.example.backend.subastas.service.SubastaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subastas")
public class SubastaController {

    private final SubastaService subastaService;
    private final InscripcionService inscripcionService;

    public SubastaController(SubastaService subastaService, InscripcionService inscripcionService) {
        this.subastaService = subastaService;
        this.inscripcionService = inscripcionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SubastaListItem>>> list(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String moneda,
            @RequestParam(required = false) String categoria,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<SubastaListItem> result = subastaService.list(usuario, estado, moneda, categoria, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Auctions retrieved", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubastaDetailResponse>> detail(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Integer id) {
        SubastaDetailResponse result = subastaService.detail(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Auction detail", result));
    }

    @GetMapping("/{id}/catalogo")
    public ResponseEntity<ApiResponse<PagedResponse<CatalogoItemListResponse>>> catalogo(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Integer id,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<CatalogoItemListResponse> result = subastaService.catalogo(usuario, id, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Catalog items retrieved", result));
    }

    @GetMapping("/{id}/catalogo/{itemId}")
    public ResponseEntity<ApiResponse<CatalogoItemDetailResponse>> itemDetail(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Integer id,
            @PathVariable Integer itemId) {
        CatalogoItemDetailResponse result = subastaService.itemDetail(usuario, id, itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item detail", result));
    }

    @GetMapping("/{id}/inscripcion")
    public ResponseEntity<ApiResponse<Boolean>> inscripcion(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Integer id) {
        boolean inscripto = inscripcionService.isInscripto(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Inscription status", inscripto));
    }

    @PostMapping("/{id}/inscribirse")
    public ResponseEntity<ApiResponse<InscripcionResponse>> inscribirse(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Integer id,
            @Valid @RequestBody InscripcionRequest req) {
        InscripcionResponse response = inscripcionService.inscribir(usuario, id, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Successfully inscribed", response));
    }
}
