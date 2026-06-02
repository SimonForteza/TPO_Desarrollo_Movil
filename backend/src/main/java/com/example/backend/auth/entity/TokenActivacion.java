package com.example.backend.auth.entity;

import com.example.backend.auth.TokenTipo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_activacion")
@Getter @Setter @NoArgsConstructor
public class TokenActivacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    @Column(nullable = false)
    private Long usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenTipo tipo;

    @Column(nullable = false)
    private LocalDateTime expiraEn;

    @Column(nullable = false)
    private boolean usado = false;

    @Column(nullable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
}
