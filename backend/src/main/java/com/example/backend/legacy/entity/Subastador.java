package com.example.backend.legacy.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subastadores")
@Getter @Setter @NoArgsConstructor
public class Subastador {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @Column(name = "matricula", length = 15)
    private String matricula;

    @Column(name = "region", length = 50)
    private String region;
}
