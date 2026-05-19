package com.example.backend.legacy.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "duenios")
@Getter @Setter @NoArgsConstructor
public class Duenio {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "numeroPais")
    private Pais pais;

    @Column(name = "verificacionFinanciera")
    private String verificacionFinanciera;

    @Column(name = "verificacionJudicial")
    private String verificacionJudicial;

    @Column(name = "calificacionRiesgo")
    private Integer calificacionRiesgo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verificador")
    private Empleado verificador;
}
