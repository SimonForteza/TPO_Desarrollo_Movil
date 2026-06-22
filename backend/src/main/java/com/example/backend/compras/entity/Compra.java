package com.example.backend.compras.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "compras")
@Getter @Setter @NoArgsConstructor
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    // FK by value to itemsCatalogo — avoids cross-package coupling with legacy.entity.ItemCatalogo
    @Column(name = "item_id", nullable = false)
    private Integer itemId;

    @Column(name = "monto_final", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoFinal;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal comision;

    @Column(name = "costo_envio", nullable = false, precision = 15, scale = 2)
    private BigDecimal costoEnvio = BigDecimal.ZERO;

    @Column(name = "retira_personalmente", nullable = false)
    private boolean retiraPersonalmente = false;

    @Column(name = "con_seguro_envio", nullable = false)
    private boolean conSeguroEnvio = false;

    @Column(nullable = false)
    private String estado = "pendiente";

    @Column(name = "creada_en", nullable = false)
    private LocalDateTime creadaEn = LocalDateTime.now();
}
