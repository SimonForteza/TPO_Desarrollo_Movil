package com.example.backend.notificaciones.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Getter @Setter @NoArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String mensaje;

    @Column(nullable = false)
    private boolean leida = false;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(name = "entidad_tipo")
    private String entidadTipo;

    @Column(name = "entidad_id")
    private Long entidadId;

    public Notificacion(Long usuarioId, String tipo, String titulo, String mensaje,
                        String entidadTipo, Long entidadId) {
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.entidadTipo = entidadTipo;
        this.entidadId = entidadId;
        this.fecha = LocalDateTime.now();
    }
}
