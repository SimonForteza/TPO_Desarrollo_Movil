package com.example.backend.legacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "seguros")
@Getter @Setter @NoArgsConstructor
public class Seguro {

    @Id
    @Column(name = "nroPoliza", length = 30)
    private String nroPoliza;

    @Column(name = "compania")
    private String compania;

    @Column(name = "polizaCombinada")
    private String polizaCombinada;

    @Column(name = "importe")
    private BigDecimal importe;
}
