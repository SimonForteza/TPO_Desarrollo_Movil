package com.example.backend.legacy.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "pujos")
@Getter @Setter @NoArgsConstructor
public class Pujo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asistente")
    private Asistente asistente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item")
    private ItemCatalogo item;

    @Column(name = "importe")
    private BigDecimal importe;

    @Column(name = "ganador")
    private String ganador;

    @Column(name = "orden")
    private Integer orden;
}
