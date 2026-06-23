package com.example.backend.multas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "multas")
@Getter
@Setter
@NoArgsConstructor
public class Multa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    // Compra impaga que originó la multa (permite derivar subasta/lote para el detalle).
    @Column(name = "compra_id")
    private Long compraId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal importe;

    @Column(nullable = false)
    private String estado = "pendiente";

    @Column(name = "vence_en")
    private LocalDateTime venceEn;

    @Column(name = "creada_en", nullable = false)
    private LocalDateTime creadaEn = LocalDateTime.now();
}
