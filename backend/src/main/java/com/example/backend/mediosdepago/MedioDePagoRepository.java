package com.example.backend.mediosdepago;

import com.example.backend.mediosdepago.entity.MedioDePago;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedioDePagoRepository extends JpaRepository<MedioDePago, Long> {

    Optional<MedioDePago> findByIdAndUsuarioId(Long id, Long usuarioId);

    boolean existsByUsuarioIdAndEstadoAndMoneda(Long usuarioId, String estado, String moneda);

    Page<MedioDePago> findByUsuarioId(Long usuarioId, Pageable pageable);
}
