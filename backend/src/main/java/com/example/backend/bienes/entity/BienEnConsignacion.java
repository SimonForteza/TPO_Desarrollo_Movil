package com.example.backend.bienes.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bienes_en_consignacion")
@Getter @Setter @NoArgsConstructor
public class BienEnConsignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "producto_id", nullable = false)
    private Integer productoId;

    @Column(nullable = false)
    private String estado;

    @Column(name = "declaracion_propiedad", nullable = false)
    private boolean declaracionPropiedad;

    @Column(name = "origen_licito_acreditado", nullable = false)
    private boolean origenLicitoAcreditado;

    @Column(name = "precio_base_propuesto", precision = 15, scale = 2)
    private BigDecimal precioBasePropuesto;

    @Column(name = "comision_propuesta", precision = 15, scale = 2)
    private BigDecimal comisionPropuesta;

    @Column(name = "ubicacion_deposito")
    private String ubicacionDeposito;

    @Column(name = "motivo_rechazo", length = 300)
    private String motivoRechazo;

    @Column(name = "gastos_devolucion", precision = 15, scale = 2)
    private BigDecimal gastosDevolucion;

    @Column(name = "subasta_id")
    private Integer subastaId;

    @Column(name = "creada_en", nullable = false)
    private LocalDateTime creadaEn = LocalDateTime.now();
}
