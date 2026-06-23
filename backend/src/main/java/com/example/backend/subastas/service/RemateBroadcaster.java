package com.example.backend.subastas.service;

import com.example.backend.subastas.dto.RemateEstadoResponse;
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

    private final SimpMessagingTemplate messagingTemplate;
    private final RemateService remateService;

    public RemateBroadcaster(SimpMessagingTemplate messagingTemplate, RemateService remateService) {
        this.messagingTemplate = messagingTemplate;
        this.remateService = remateService;
    }

    public void broadcast(Integer subastaId) {
        RemateEstadoResponse estado = remateService.estado(subastaId);
        messagingTemplate.convertAndSend("/topic/subastas/" + subastaId, estado);
    }
}
