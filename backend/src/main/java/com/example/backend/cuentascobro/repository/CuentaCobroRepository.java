package com.example.backend.cuentascobro.repository;

import com.example.backend.cuentascobro.entity.CuentaCobro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaCobroRepository extends JpaRepository<CuentaCobro, Long> {
    boolean existsByUsuarioId(Long usuarioId);
}
