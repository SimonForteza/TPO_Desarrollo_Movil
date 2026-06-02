package com.example.backend.pujas;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.pujas.dto.PujaHistoryItem;
import com.example.backend.pujas.dto.PujaRequest;
import com.example.backend.pujas.dto.PujaResponse;
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
@RequestMapping("/subastas/{subastaId}")
public class PujaController {

    private final PujaService pujaService;

    public PujaController(PujaService pujaService) {
        this.pujaService = pujaService;
    }

    @GetMapping("/pujas")
    public ResponseEntity<ApiResponse<PagedResponse<PujaHistoryItem>>> historial(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Integer subastaId,
            @PageableDefault(size = 20) Pageable pageable) {
        PagedResponse<PujaHistoryItem> result = pujaService.historial(usuario, subastaId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Bid history retrieved", result));
    }

    @PostMapping("/pujar")
    public ResponseEntity<ApiResponse<PujaResponse>> pujar(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Integer subastaId,
            @Valid @RequestBody PujaRequest req) {
        PujaResponse response = pujaService.pujar(usuario, subastaId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Bid placed", response));
    }
}
