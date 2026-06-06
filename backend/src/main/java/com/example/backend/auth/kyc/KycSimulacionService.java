package com.example.backend.auth.kyc;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class KycSimulacionService {

    private static final long DELAY_MS = 40_000L;

    private final ConcurrentHashMap<Long, TokenInfo> tokensAprobados = new ConcurrentHashMap<>();

    @Async
    public void iniciarVerificacion(Long usuarioId, String token, LocalDateTime expiraEn) {
        try {
            Thread.sleep(DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return;
        }
        tokensAprobados.put(usuarioId, new TokenInfo(token, expiraEn));
    }

    public Optional<TokenInfo> obtener(Long usuarioId) {
        return Optional.ofNullable(tokensAprobados.get(usuarioId));
    }

    public record TokenInfo(String token, LocalDateTime expiraEn) {}
}
