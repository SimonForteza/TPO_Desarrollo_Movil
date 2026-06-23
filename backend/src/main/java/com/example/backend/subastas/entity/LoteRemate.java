package com.example.backend.subastas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Reloj autoritativo del remate de un lote (item de catálogo). Tabla nueva — no toca la
 * estructura SQL legacy. Guarda el {@code deadline} (cuándo cae el martillo) del lote que
 * está actualmente en remate. Cada puja nueva reinicia el deadline; cuando el deadline
 * vence, el lote se cierra (se adjudica al mejor postor).
 *
 * FK por valor a itemsCatalogo (igual criterio que {@code Compra}) para no acoplar con
 * legacy.entity.ItemCatalogo.
 */
@Entity
@Table(name = "lote_remate")
@Getter @Setter @NoArgsConstructor
public class LoteRemate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subasta_id", nullable = false)
    private Integer subastaId;

    @Column(name = "item_id", nullable = false, unique = true)
    private Integer itemId;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    public LoteRemate(Integer subastaId, Integer itemId, LocalDateTime deadline) {
        this.subastaId = subastaId;
        this.itemId = itemId;
        this.deadline = deadline;
    }
}
