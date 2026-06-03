package com.example.backend.cuentascobro.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cuentas_cobro")
@Getter @Setter @NoArgsConstructor
public class CuentaCobro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String banco;

    @Column(nullable = false)
    private String pais;

    @Column(name = "numero_cuenta", nullable = false)
    private String numeroCuenta;
}
