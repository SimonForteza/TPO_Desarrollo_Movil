package com.example.backend.me.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.me.dto.ParticipacionesResponse;
import com.example.backend.me.service.ParticipacionService;
import com.example.backend.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me")
@Tag(name = "Me", description = "Current user's history and metrics")
public class MeController {

    private final ParticipacionService participacionService;

    public MeController(ParticipacionService participacionService) {
        this.participacionService = participacionService;
    }

    @GetMapping("/participaciones")
    @Operation(summary = "Participation history and metrics (frame 'Mi historial')")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "History retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    public ResponseEntity<ApiResponse<ParticipacionesResponse>> participaciones(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false, defaultValue = "todas") String resultado) {
        ParticipacionesResponse result = participacionService.participaciones(usuario, resultado);
        return ResponseEntity.ok(ApiResponse.ok("History retrieved", result));
    }
}
