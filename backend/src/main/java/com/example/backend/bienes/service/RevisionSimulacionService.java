package com.example.backend.bienes.service;

import com.example.backend.bienes.dto.AprobarBienRequest;
import com.example.backend.bienes.dto.RechazarBienRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Random;

@Service
public class RevisionSimulacionService {

    private static final long[] PRECIOS = {
        100_000, 150_000, 200_000, 250_000, 300_000,
        400_000, 500_000, 600_000, 800_000
    };

    private static final String[] MOTIVOS_RECHAZO = {
        "El bien no cumple los estándares de autenticidad requeridos para subasta.",
        "El estado de conservación no es apto para ser incluido en catálogo.",
        "Documentación de origen insuficiente para proceder con la consignación."
    };

    private static final String UBICACION_MOCK = "Depósito Central — Av. Corrientes 1234, CABA";

    private final AdminBienService adminBienService;
    private final Random random = new Random();

    public RevisionSimulacionService(AdminBienService adminBienService) {
        this.adminBienService = adminBienService;
    }

    @Async
    public void simularRevision(Long bienId) {
        try {
            Thread.sleep(15_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return;
        }

        try {
            if (random.nextDouble() < 0.90) {
                BigDecimal precio = BigDecimal.valueOf(PRECIOS[random.nextInt(PRECIOS.length)]);
                BigDecimal comision = precio.multiply(new BigDecimal("0.10"));
                adminBienService.aprobar(bienId,
                        new AprobarBienRequest(precio, comision, UBICACION_MOCK));
            } else {
                String motivo = MOTIVOS_RECHAZO[random.nextInt(MOTIVOS_RECHAZO.length)];
                adminBienService.rechazar(bienId, new RechazarBienRequest(motivo));
            }
        } catch (Exception ignored) {
            // bien ya procesado o no existe
        }
    }
}
