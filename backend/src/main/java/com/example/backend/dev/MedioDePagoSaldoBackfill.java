package com.example.backend.dev;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Backfill idempotente: asigna un saldo por defecto (según moneda) a los medios de pago
 * que se crearon antes de que existiera la columna `saldo` y quedaron en NULL.
 * Misma regla que los medios nuevos (ARS -> 1.000.000, USD -> 1.000). Tras la primera
 * corrida afecta 0 filas. Mantiene homogénea la base compartida del equipo.
 */
@Component
@Profile("dev")
@Order(0)
public class MedioDePagoSaldoBackfill implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        em.createQuery("UPDATE MedioDePago m SET m.saldo = :v WHERE m.saldo IS NULL AND m.moneda = 'ARS'")
                .setParameter("v", new BigDecimal("1000000.00"))
                .executeUpdate();

        em.createQuery("UPDATE MedioDePago m SET m.saldo = :v WHERE m.saldo IS NULL AND m.moneda = 'USD'")
                .setParameter("v", new BigDecimal("1000.00"))
                .executeUpdate();

        // Defensa por si quedara algún medio sin moneda válida: saldo 0 (no cubre ninguna compra).
        em.createQuery("UPDATE MedioDePago m SET m.saldo = :v WHERE m.saldo IS NULL")
                .setParameter("v", BigDecimal.ZERO)
                .executeUpdate();
    }
}
