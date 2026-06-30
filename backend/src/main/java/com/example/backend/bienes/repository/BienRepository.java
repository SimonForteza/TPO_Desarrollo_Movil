package com.example.backend.bienes.repository;

import com.example.backend.bienes.entity.BienEnConsignacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BienRepository extends JpaRepository<BienEnConsignacion, Long> {
    Page<BienEnConsignacion> findByUsuarioId(Long usuarioId, Pageable pageable);
    Optional<BienEnConsignacion> findByIdAndUsuarioId(Long id, Long usuarioId);
    Optional<BienEnConsignacion> findByProductoId(Integer productoId);
    Page<BienEnConsignacion> findByEstado(String estado, Pageable pageable);
    Page<BienEnConsignacion> findByEstadoAndSubastaIdIsNull(String estado, Pageable pageable);
    List<BienEnConsignacion> findByEstadoAndSubastaIdIsNull(String estado);
}
