package com.example.backend.multas.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.multas.dto.MultaDetail;
import com.example.backend.multas.dto.MultaListItem;
import com.example.backend.multas.dto.PagarMultaRequest;
import com.example.backend.multas.service.MultaService;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/multas")
@Tag(name = "Fines", description = "User fines generated when a won lot is not paid on time")
public class MultaController {

    private final MultaService multaService;

    public MultaController(MultaService multaService) {
        this.multaService = multaService;
    }

    @GetMapping
    @Operation(summary = "List the current user's fines (optional filter by estado)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Fines retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    public ResponseEntity<ApiResponse<PagedResponse<MultaListItem>>> list(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) String estado,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<MultaListItem> result = multaService.list(usuario, estado, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Fines retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a fine detail (subasta, motivo, importe, vencimiento)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Fine retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Fine not found")
    })
    public ResponseEntity<ApiResponse<MultaDetail>> detail(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Fine retrieved", multaService.detail(usuario, id)));
    }

    @PostMapping("/{id}/pagar")
    @Operation(summary = "Pay a fine (mocked); unlocks access to auctions")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Fine paid"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Fine not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Fine already paid"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Business rule violated")
    })
    public ResponseEntity<ApiResponse<MultaDetail>> pagar(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @Valid @RequestBody PagarMultaRequest req) {
        MultaDetail result = multaService.pagar(usuario, id, req.medioPagoId());
        return ResponseEntity.ok(ApiResponse.ok("Fine paid", result));
    }
}
