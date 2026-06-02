package com.example.backend.mediosdepago;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.mediosdepago.dto.MedioDePagoRequest;
import com.example.backend.mediosdepago.dto.MedioDePagoResponse;
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
@RequestMapping("/medios-pago")
public class MedioDePagoController {

    private final MedioDePagoService medioDePagoService;

    public MedioDePagoController(MedioDePagoService medioDePagoService) {
        this.medioDePagoService = medioDePagoService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<MedioDePagoResponse>>> list(
            @AuthenticationPrincipal Usuario usuario,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<MedioDePagoResponse> result = medioDePagoService.list(usuario, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Payment methods retrieved", result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedioDePagoResponse>> create(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody MedioDePagoRequest req) {
        MedioDePagoResponse response = medioDePagoService.create(usuario, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payment method created", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        medioDePagoService.delete(usuario, id);
        return ResponseEntity.noContent().build();
    }
}
