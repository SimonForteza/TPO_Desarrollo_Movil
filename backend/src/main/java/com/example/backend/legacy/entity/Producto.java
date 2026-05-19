package com.example.backend.legacy.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "productos")
@Getter @Setter @NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "disponible")
    private String disponible;

    @Column(name = "descripcionCatalogo", length = 500)
    private String descripcionCatalogo;

    // URL pointing to a signed PDF — not the document content
    @Column(name = "descripcionCompleta", length = 300)
    private String descripcionCompleta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisor")
    private Empleado revisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duenio")
    private Duenio duenio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguro", referencedColumnName = "nroPoliza", nullable = true)
    private Seguro seguro;
}
