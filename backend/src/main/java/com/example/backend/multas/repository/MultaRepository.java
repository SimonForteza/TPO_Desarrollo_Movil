package com.example.backend.multas.repository;

import com.example.backend.multas.entity.Multa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MultaRepository extends JpaRepository<Multa, Long> {

    boolean existsByUsuarioIdAndEstado(Long usuarioId, String estado);
}
