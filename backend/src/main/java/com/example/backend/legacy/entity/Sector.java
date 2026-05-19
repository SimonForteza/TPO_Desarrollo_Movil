package com.example.backend.legacy.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sectores")
@Getter @Setter @NoArgsConstructor
public class Sector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "nombreSector")
    private String nombreSector;

    @Column(name = "codigoSector")
    private String codigoSector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsableSector")
    private Empleado responsableSector;
}
