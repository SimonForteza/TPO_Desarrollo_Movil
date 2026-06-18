package com.example.backend.auth.service;

import com.example.backend.auth.dto.*;
import com.example.backend.auth.entity.TokenActivacion;
import com.example.backend.auth.entity.Usuario;
import com.example.backend.auth.kyc.KycSimulacionService;
import com.example.backend.auth.repository.TokenActivacionRepository;
import com.example.backend.auth.repository.UsuarioRepository;
import com.example.backend.auth.security.JwtUtil;
import com.example.backend.auth.security.TokenTipo;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.entity.Pais;
import com.example.backend.legacy.entity.Persona;
import com.example.backend.legacy.repository.ClienteRepository;
import com.example.backend.legacy.repository.PaisRepository;
import com.example.backend.legacy.repository.PersonaRepository;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ConflictException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.shared.exception.TokenExpiredException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final TokenActivacionRepository tokenActivacionRepository;
    private final PersonaRepository personaRepository;
    private final ClienteRepository clienteRepository;
    private final PaisRepository paisRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final KycSimulacionService kycSimulacionService;

    public AuthService(UsuarioRepository usuarioRepository,
                       TokenActivacionRepository tokenActivacionRepository,
                       PersonaRepository personaRepository,
                       ClienteRepository clienteRepository,
                       PaisRepository paisRepository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder,
                       KycSimulacionService kycSimulacionService) {
        this.usuarioRepository = usuarioRepository;
        this.tokenActivacionRepository = tokenActivacionRepository;
        this.personaRepository = personaRepository;
        this.clienteRepository = clienteRepository;
        this.paisRepository = paisRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.kycSimulacionService = kycSimulacionService;
    }

    public RegistroEtapa1Response registrar(RegistroEtapa1Request req) {
        if (usuarioRepository.findByEmail(req.email()).isPresent()) {
            throw new ConflictException("Email already registered");
        }
        if (personaRepository.existsByDocumento(req.documento())) {
            throw new ConflictException("Document already registered");
        }

        Pais pais = paisRepository.findById(req.paisId())
                .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + req.paisId()));

        byte[] fotoFrente = Base64.getDecoder().decode(req.fotoDniFrente());

        Persona persona = new Persona();
        persona.setNombre(req.nombre() + " " + req.apellido());
        persona.setDocumento(req.documento());
        persona.setDireccion(req.direccion());
        persona.setEstado("inactivo");
        persona.setFoto(fotoFrente);
        personaRepository.save(persona);

        Cliente cliente = new Cliente();
        cliente.setPersona(persona);
        cliente.setPais(pais);
        cliente.setAdmitido("no");
        cliente.setCategoria("comun");
        cliente.setVerificador(null);
        clienteRepository.save(cliente);

        Usuario usuario = new Usuario();
        usuario.setEmail(req.email());
        usuario.setPasswordHash("PENDING");
        usuario.setEstadoKyc("pendiente_kyc");
        usuario.setClienteId(persona.getIdentificador());
        usuarioRepository.save(usuario);

        LocalDateTime expiraEn = LocalDateTime.now().plusHours(48);
        TokenActivacion token = new TokenActivacion();
        token.setToken(UUID.randomUUID().toString());
        token.setUsuarioId(usuario.getId());
        token.setTipo(TokenTipo.ACTIVATION);
        token.setExpiraEn(expiraEn);
        token.setUsado(false);
        tokenActivacionRepository.save(token);

        kycSimulacionService.iniciarVerificacion(usuario.getId(), token.getToken(), expiraEn);
        return new RegistroEtapa1Response(usuario.getId(), usuario.getEmail());
    }

    public void completarRegistro(CompletarRegistroRequest req) {
        if (!req.password().equals(req.passwordConfirmacion())) {
            throw new BusinessRuleException("Passwords do not match");
        }

        TokenActivacion token = tokenActivacionRepository.findByTokenAndUsadoFalse(req.tokenActivacion())
                .orElseThrow(() -> new ResourceNotFoundException("Activation token not found or already used"));

        if (token.getTipo() != TokenTipo.ACTIVATION) {
            throw new BusinessRuleException("Invalid token type");
        }
        if (token.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Activation token has expired");
        }

        Usuario usuario = usuarioRepository.findById(token.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        usuario.setEstadoKyc("activo");
        token.setUsado(true);
    }

    public LoginResponse login(LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        if (!"activo".equals(usuario.getEstadoKyc())) {
            throw new BusinessRuleException("Account not active");
        }

        String accessToken = jwtUtil.generateAccessToken(usuario);
        String refreshToken = jwtUtil.generateRefreshToken(usuario);
        usuario.setRefreshToken(refreshToken);

        return new LoginResponse(accessToken, refreshToken, buildMeResponse(usuario));
    }

    public RefreshResponse refresh(RefreshRequest req) {
        if (!jwtUtil.validateRefreshToken(req.refreshToken())) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        String email = jwtUtil.extractEmail(req.refreshToken());
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!req.refreshToken().equals(usuario.getRefreshToken())) {
            throw new BadCredentialsException("Refresh token revoked");
        }

        String newAccess = jwtUtil.generateAccessToken(usuario);
        String newRefresh = jwtUtil.generateRefreshToken(usuario);
        usuario.setRefreshToken(newRefresh);

        return new RefreshResponse(newAccess, newRefresh);
    }

    public void resetearPassword(ResetearPasswordRequest req) {
        if (!req.password().equals(req.passwordConfirmacion())) {
            throw new BusinessRuleException("Passwords do not match");
        }

        TokenActivacion token = tokenActivacionRepository.findByTokenAndUsadoFalse(req.tokenRecuperacion())
                .orElseThrow(() -> new ResourceNotFoundException("Recovery token not found or already used"));

        if (token.getTipo() != TokenTipo.PASSWORD_RECOVERY) {
            throw new BusinessRuleException("Invalid token type");
        }
        if (token.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Recovery token has expired");
        }

        Usuario usuario = usuarioRepository.findById(token.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        usuario.setRefreshToken(null);
        token.setUsado(true);
    }

    public RecuperarPasswordResponse recuperarPassword(RecuperarPasswordRequest req) {
        return usuarioRepository.findByEmail(req.email())
                .map(usuario -> {
                    LocalDateTime expiraEn = LocalDateTime.now().plusMinutes(30);
                    TokenActivacion token = new TokenActivacion();
                    token.setToken(UUID.randomUUID().toString());
                    token.setUsuarioId(usuario.getId());
                    token.setTipo(TokenTipo.PASSWORD_RECOVERY);
                    token.setExpiraEn(expiraEn);
                    token.setUsado(false);
                    tokenActivacionRepository.save(token);
                    return new RecuperarPasswordResponse(token.getToken(), expiraEn);
                })
                .orElse(new RecuperarPasswordResponse(null, null));
    }

    @Transactional(readOnly = true)
    public UsuarioMeResponse me(Usuario usuario) {
        return buildMeResponse(usuario);
    }

    public ActualizarPerfilResponse actualizarPerfil(Usuario usuarioAuth, ActualizarPerfilRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioAuth.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));
        Persona persona = cliente.getPersona();

        persona.setNombre(req.nombre());
        persona.setDireccion(req.direccion());

        if (!usuario.getEmail().equalsIgnoreCase(req.email())) {
            if (usuarioRepository.existsByEmail(req.email())) {
                throw new ConflictException("Email already registered");
            }
            usuario.setEmail(req.email());
        }

        String accessToken = jwtUtil.generateAccessToken(usuario);
        String refreshToken = jwtUtil.generateRefreshToken(usuario);
        usuario.setRefreshToken(refreshToken);

        return new ActualizarPerfilResponse(buildMeResponse(usuario), accessToken, refreshToken);
    }

    public void cambiarPassword(Usuario usuarioAuth, CambiarPasswordRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioAuth.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(req.passwordActual(), usuario.getPasswordHash())) {
            throw new BusinessRuleException("Contraseña actual incorrecta");
        }
        if (!req.passwordNueva().equals(req.passwordConfirmacion())) {
            throw new BusinessRuleException("Passwords do not match");
        }

        usuario.setPasswordHash(passwordEncoder.encode(req.passwordNueva()));
        usuario.setRefreshToken(null);
    }


public void validarRegistro(String email, String documento) {
    if (usuarioRepository.existsByEmail(email)) {
        throw new RuntimeException("El email ya está registrado.");
    }
    if (personaRepository.existsByDocumento(documento)) {
        throw new RuntimeException("El documento ya está registrado.");
    }
}

    private UsuarioMeResponse buildMeResponse(Usuario usuario) {
        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));
        Persona persona = cliente.getPersona();

        String nombre = "";
        String apellido = "";
        if (persona.getNombre() != null) {
            String[] parts = persona.getNombre().split(" ", 2);
            nombre = parts[0];
            apellido = parts.length > 1 ? parts[1] : "";
        }

        return new UsuarioMeResponse(
                usuario.getId(),
                usuario.getEmail(),
                nombre,
                apellido,
                persona.getDocumento(),
                usuario.getEstadoKyc(),
                cliente.getCategoria()
        );
    }
}
