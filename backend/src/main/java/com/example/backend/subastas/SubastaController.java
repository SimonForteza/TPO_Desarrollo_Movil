package com.example.backend.subastas;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.subastas.dto.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subastas")
public class SubastaController {

    private final SubastaService subastaService;

    public SubastaController(SubastaService subastaService) {
        this.subastaService = subastaService;
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
}
