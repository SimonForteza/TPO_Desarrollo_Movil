package com.example.backend.auth;

import com.example.backend.auth.dto.*;
import com.example.backend.auth.entity.Usuario;
import com.example.backend.auth.kyc.KycSimulacionService;
import com.example.backend.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final KycSimulacionService kycSimulacionService;

    public AuthController(AuthService authService, KycSimulacionService kycSimulacionService) {
        this.authService = authService;
        this.kycSimulacionService = kycSimulacionService;
    }

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<RegistroEtapa1Response>> registro(
            @Valid @RequestBody RegistroEtapa1Request req) {
        RegistroEtapa1Response response = authService.registrar(req);
        kycSimulacionService.iniciarVerificacion(
                response.usuarioId(), response.tokenActivacion(), response.expiraEn());
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

    @PostMapping("/recuperar-password")
    public ResponseEntity<ApiResponse<RecuperarPasswordResponse>> recuperarPassword(
            @Valid @RequestBody RecuperarPasswordRequest req) {
        RecuperarPasswordResponse response = authService.recuperarPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("If that email exists, a recovery token has been sent.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UsuarioMeResponse>> me(
            @AuthenticationPrincipal Usuario usuario) {
        UsuarioMeResponse response = authService.me(usuario);
        return ResponseEntity.ok(ApiResponse.ok("User profile", response));
    }
}
