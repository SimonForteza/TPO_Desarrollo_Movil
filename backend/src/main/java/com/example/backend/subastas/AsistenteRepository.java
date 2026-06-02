package com.example.backend.subastas;

import com.example.backend.legacy.entity.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {

    @Query("""
        SELECT COUNT(a) > 0 FROM Asistente a
        WHERE a.cliente.identificador = :clienteId
          AND a.subasta.estado = 'abierta'
        """)
    boolean isUserInActiveAuction(@Param("clienteId") Integer clienteId);

    long countBySubastaIdentificador(Integer subastaId);

    boolean existsByClienteIdentificadorAndSubastaIdentificador(Integer clienteId, Integer subastaId);
}
