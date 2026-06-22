package com.example.backend.cuentascobro.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.cuentascobro.dto.CuentaCobroRequest;
import com.example.backend.cuentascobro.dto.CuentaCobroResponse;
import com.example.backend.cuentascobro.service.CuentaCobroService;
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
@RequestMapping("/cuentas-cobro")
@Tag(name = "Collection accounts", description = "User declared accounts used to collect payments for consigned goods")
public class CuentaCobroController {

    private final CuentaCobroService cuentaCobroService;

    public CuentaCobroController(CuentaCobroService cuentaCobroService) {
        this.cuentaCobroService = cuentaCobroService;
    }

    @GetMapping
    @Operation(summary = "List the current user's collection accounts")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Collection accounts retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    public ResponseEntity<ApiResponse<PagedResponse<CuentaCobroResponse>>> list(
            @AuthenticationPrincipal Usuario usuario,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<CuentaCobroResponse> result = cuentaCobroService.list(usuario, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Collection accounts retrieved", result));
    }

    @PostMapping
    @Operation(summary = "Declare a new collection account for the current user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Collection account created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or missing fields"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    public ResponseEntity<ApiResponse<CuentaCobroResponse>> create(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CuentaCobroRequest req) {
        CuentaCobroResponse response = cuentaCobroService.create(usuario, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Collection account created", response));
    }
}
