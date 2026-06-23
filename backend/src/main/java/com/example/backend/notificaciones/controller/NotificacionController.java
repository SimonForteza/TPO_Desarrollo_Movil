package com.example.backend.notificaciones.controller;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.notificaciones.dto.NotificacionResponse;
import com.example.backend.notificaciones.service.NotificacionService;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.dto.PagedResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NotificacionResponse>>> listar(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) Boolean leida,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<NotificacionResponse> data = notificacionService.listar(usuario.getId(), leida, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", data));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<ApiResponse<NotificacionResponse>> marcarLeida(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        NotificacionResponse data = notificacionService.marcarLeida(id, usuario.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", data));
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<ApiResponse<Void>> marcarTodasLeidas(
            @AuthenticationPrincipal Usuario usuario) {
        notificacionService.marcarTodasLeidas(usuario.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @GetMapping("/no-leidas/count")
    public ResponseEntity<ApiResponse<Long>> contarNoLeidas(
            @AuthenticationPrincipal Usuario usuario) {
        long count = notificacionService.contarNoLeidas(usuario.getId());
        return ResponseEntity.ok(ApiResponse.ok("Unread count", count));
    }
}
