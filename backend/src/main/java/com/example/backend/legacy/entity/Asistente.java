package com.example.backend.legacy.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "asistentes")
@SecondaryTable(
    name = "asistentes_medio_pago",
    pkJoinColumns = @PrimaryKeyJoinColumn(name = "asistente_id")
)
@Getter @Setter @NoArgsConstructor
public class Asistente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "numeroPostor")
    private Integer numeroPostor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subasta")
    private Subasta subasta;

    @Column(name = "medio_pago_id", table = "asistentes_medio_pago")
    private Long medioPagoId;
}
