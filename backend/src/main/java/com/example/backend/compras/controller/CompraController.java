package com.example.backend.compras.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.compras.dto.CompraDetail;
import com.example.backend.compras.dto.CompraListItem;
import com.example.backend.compras.dto.FacturaResponse;
import com.example.backend.compras.service.CompraService;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/compras")
@Tag(name = "Purchases", description = "User purchases generated when an auction is closed, and their invoices")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @GetMapping
    @Operation(summary = "List the current user's purchases")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Purchases retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    public ResponseEntity<ApiResponse<PagedResponse<CompraListItem>>> list(
            @AuthenticationPrincipal Usuario usuario,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<CompraListItem> result = compraService.list(usuario, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Purchases retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a purchase breakdown (amount, commission, shipping, total)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Purchase retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Purchase not found")
    })
    public ResponseEntity<ApiResponse<CompraDetail>> detail(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        CompraDetail result = compraService.detail(usuario, id);
        return ResponseEntity.ok(ApiResponse.ok("Purchase retrieved", result));
    }

    @GetMapping("/{id}/factura")
    @Operation(summary = "Get the purchase invoice (mocked PDF URL); formato=json|pdf")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invoice retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Purchase not found")
    })
    public ResponseEntity<ApiResponse<FacturaResponse>> factura(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @RequestParam(defaultValue = "json") String formato) {
        FacturaResponse result = compraService.factura(usuario, id, formato);
        return ResponseEntity.ok(ApiResponse.ok("Invoice retrieved", result));
    }
}
