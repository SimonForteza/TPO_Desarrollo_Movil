package com.example.backend.subastas.repository;

import com.example.backend.legacy.entity.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {

    @Query("""
        SELECT COUNT(a) > 0 FROM Asistente a
        WHERE a.cliente.identificador = :clienteId
          AND a.subasta.estado = 'abierta'
        """)
    boolean isUserInActiveAuction(@Param("clienteId") Integer clienteId);

    long countBySubastaIdentificador(Integer subastaId);

    boolean existsByClienteIdentificadorAndSubastaIdentificador(Integer clienteId, Integer subastaId);

    Optional<Asistente> findByClienteIdentificadorAndSubastaIdentificador(Integer clienteId, Integer subastaId);

    @Query("""
        SELECT COUNT(a) > 0 FROM Asistente a
        WHERE a.medioPagoId = :medioPagoId
          AND a.subasta.estado = 'abierta'
        """)
    boolean isMedioInActiveAuction(@Param("medioPagoId") Long medioPagoId);
}
