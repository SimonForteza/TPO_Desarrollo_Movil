package com.example.backend.legacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "paises")
@Getter @Setter @NoArgsConstructor
public class Pais {

    @Id
    @Column(name = "numero")
    private Integer numero;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "nombreCorto")
    private String nombreCorto;

    @Column(name = "capital")
    private String capital;

    @Column(name = "nacionalidad")
    private String nacionalidad;

    @Column(name = "idiomas")
    private String idiomas;
}
