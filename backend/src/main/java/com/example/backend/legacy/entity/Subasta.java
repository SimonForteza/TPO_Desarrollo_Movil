package com.example.backend.legacy.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "subastas")
@Getter @Setter @NoArgsConstructor
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora")
    private LocalTime hora;

    @Column(name = "estado")
    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subastador", nullable = true)
    private Subastador subastador;

    @Column(name = "ubicacion")
    private String ubicacion;

    @Column(name = "capacidadAsistentes")
    private Integer capacidadAsistentes;

    @Column(name = "tieneDeposito")
    private String tieneDeposito;

    @Column(name = "seguridadPropia")
    private String seguridadPropia;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "moneda")
    private String moneda;
}
