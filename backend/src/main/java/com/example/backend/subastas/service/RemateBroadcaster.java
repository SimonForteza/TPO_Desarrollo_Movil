package com.example.backend.subastas.service;

import com.example.backend.subastas.dto.RemateEstadoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes the live auction state to STOMP subscribers. Bundles {@link SimpMessagingTemplate} with
 * {@link RemateService} so callers (e.g. {@code PujaService} after a confirmed bid) push a fresh
 * snapshot to {@code /topic/subastas/{id}}. The raw {@link RemateEstadoResponse} is sent (no
 * {@code ApiResponse} wrapper) to keep client-side parsing simple.
 */
@Component
public class RemateBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(RemateBroadcaster.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final RemateService remateService;

    public RemateBroadcaster(SimpMessagingTemplate messagingTemplate, RemateService remateService) {
        this.messagingTemplate = messagingTemplate;
        this.remateService = remateService;
    }

    /**
     * Best-effort: el push en tiempo real nunca debe romper la operación que lo dispara.
     * Suele invocarse desde un {@code afterCommit} (la puja ya está commiteada), donde una
     * excepción se propagaría al caller y devolvería un 500 pese a que la puja se guardó.
     * Por eso cualquier falla se loguea y se traga; el polling del cliente recupera el estado.
     */
    public void broadcast(Integer subastaId) {
        try {
            RemateEstadoResponse estado = remateService.estado(subastaId);
            messagingTemplate.convertAndSend("/topic/subastas/" + subastaId, estado);
        } catch (Exception e) {
            log.warn("Failed to broadcast live auction state for subasta {}", subastaId, e);
        }
    }
}
