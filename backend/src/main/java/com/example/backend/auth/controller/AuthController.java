package com.example.backend.auth.controller;

import com.example.backend.auth.repository.UsuarioRepository;
import com.example.backend.auth.dto.*;
import com.example.backend.auth.entity.Usuario;
import com.example.backend.auth.kyc.KycSimulacionService;
import com.example.backend.auth.service.AuthService;
import com.example.backend.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.backend.legacy.repository.PersonaRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final KycSimulacionService kycSimulacionService;
    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;

    public AuthController(AuthService authService, KycSimulacionService kycSimulacionService, UsuarioRepository usuarioRepository, PersonaRepository personaRepository) {
        this.authService = authService;
        this.kycSimulacionService = kycSimulacionService;
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
    }

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<RegistroEtapa1Response>> registro(
            @Valid @RequestBody RegistroEtapa1Request req) {
        RegistroEtapa1Response response = authService.registrar(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration started. Awaiting KYC approval.", response));
    }

    @GetMapping("/kyc-estado/{usuarioId}")
    public ResponseEntity<ApiResponse<KycEstadoResponse>> kycEstado(@PathVariable Long usuarioId) {
        KycEstadoResponse body = kycSimulacionService.obtener(usuarioId)
                .map(info -> new KycEstadoResponse(true, info.token(), info.expiraEn()))
                .orElse(new KycEstadoResponse(false, null, null));
        return ResponseEntity.ok(ApiResponse.ok("KYC status", body));
    }

    @PostMapping("/completar-registro")
    public ResponseEntity<ApiResponse<Void>> completarRegistro(
            @Valid @RequestBody CompletarRegistroRequest req) {
        authService.completarRegistro(req);
        return ResponseEntity.ok(ApiResponse.ok("Registration completed. You can now log in.", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest req) {
        LoginResponse response = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshResponse>> refresh(
            @Valid @RequestBody RefreshRequest req) {
        RefreshResponse response = authService.refresh(req);
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed", response));
    }

    @PostMapping("/resetear-password")
    public ResponseEntity<ApiResponse<Void>> resetearPassword(
            @Valid @RequestBody ResetearPasswordRequest req) {
        authService.resetearPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successful. You can now log in.", null));
    }

    @PostMapping("/recuperar-password")
    public ResponseEntity<ApiResponse<RecuperarPasswordResponse>> recuperarPassword(
            @Valid @RequestBody RecuperarPasswordRequest req) {
        RecuperarPasswordResponse response = authService.recuperarPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("If that email exists, a recovery token has been sent.", response));
    }

    @GetMapping("/verificar-disponibilidad")
    public ResponseEntity<?> verificar(@RequestParam String email, @RequestParam String documento) {
    if (usuarioRepository.existsByEmail(email)) return ResponseEntity.badRequest().body("El email ya existe");
    if (personaRepository.existsByDocumento(documento)) return ResponseEntity.badRequest().body("El documento ya está registrado");
    return ResponseEntity.ok("Disponible");
}

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UsuarioMeResponse>> me(
            @AuthenticationPrincipal Usuario usuario) {
        UsuarioMeResponse response = authService.me(usuario);
        return ResponseEntity.ok(ApiResponse.ok("User profile", response));
    }

    @PutMapping("/perfil")
    public ResponseEntity<ApiResponse<ActualizarPerfilResponse>> actualizarPerfil(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody ActualizarPerfilRequest req) {
        ActualizarPerfilResponse response = authService.actualizarPerfil(usuario, req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", response));
    }

    @PostMapping("/cambiar-password")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CambiarPasswordRequest req) {
        authService.cambiarPassword(usuario, req);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
