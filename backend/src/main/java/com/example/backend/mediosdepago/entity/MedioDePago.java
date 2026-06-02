package com.example.backend.mediosdepago.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medios_de_pago")
@Getter
@Setter
@NoArgsConstructor
public class MedioDePago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String moneda;

    @Column(nullable = false)
    private String estado = "pendiente";

    @Column(name = "datos_enmascarados")
    private String datosEnmascarados;
}
