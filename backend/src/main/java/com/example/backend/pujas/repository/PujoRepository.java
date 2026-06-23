package com.example.backend.pujas.repository;

import com.example.backend.legacy.entity.Pujo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PujoRepository extends JpaRepository<Pujo, Integer> {

    List<Pujo> findByItemIdentificador(Integer itemId);

    Optional<Pujo> findTopByItemIdentificadorOrderByImporteDesc(Integer itemId);

    @Query("""
        SELECT p FROM Pujo p
        WHERE p.item.catalogo.subasta.identificador = :subastaId
        ORDER BY p.identificador ASC
        """)
    Page<Pujo> findHistoryBySubasta(@Param("subastaId") Integer subastaId, Pageable pageable);

    @Query("SELECT MAX(p.importe) FROM Pujo p WHERE p.item.identificador = :itemId")
    BigDecimal findMaxImporteByItem(@Param("itemId") Integer itemId);

    boolean existsByAsistenteIdentificador(Integer asistenteId);

    /** Total ofertado por un cliente: suma de los importes de todas sus pujas (métrica "Ofertado"). */
    @Query("""
        SELECT COALESCE(SUM(p.importe), 0)
        FROM Pujo p
        WHERE p.asistente.cliente.identificador = :clienteId
        """)
    BigDecimal sumImporteByClienteId(@Param("clienteId") Integer clienteId);
}
