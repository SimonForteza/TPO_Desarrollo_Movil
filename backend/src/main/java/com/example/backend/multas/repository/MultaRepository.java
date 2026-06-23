package com.example.backend.multas.repository;

import com.example.backend.multas.entity.Multa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MultaRepository extends JpaRepository<Multa, Long> {

    boolean existsByUsuarioIdAndEstado(Long usuarioId, String estado);

    Page<Multa> findByUsuarioId(Long usuarioId, Pageable pageable);

    Page<Multa> findByUsuarioIdAndEstado(Long usuarioId, String estado, Pageable pageable);

    List<Multa> findByUsuarioIdAndEstado(Long usuarioId, String estado);

    Optional<Multa> findByIdAndUsuarioId(Long id, Long usuarioId);

    boolean existsByCompraId(Long compraId);
}
