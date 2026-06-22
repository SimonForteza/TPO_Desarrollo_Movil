package com.example.backend.pujas.repository;

import com.example.backend.legacy.entity.Pujo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface PujoRepository extends JpaRepository<Pujo, Integer> {

    @Query("""
        SELECT p FROM Pujo p
        WHERE p.item.catalogo.subasta.identificador = :subastaId
        ORDER BY p.identificador ASC
        """)
    Page<Pujo> findHistoryBySubasta(@Param("subastaId") Integer subastaId, Pageable pageable);

    @Query("SELECT MAX(p.importe) FROM Pujo p WHERE p.item.identificador = :itemId")
    BigDecimal findMaxImporteByItem(@Param("itemId") Integer itemId);
}
