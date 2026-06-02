package com.example.backend.subastas;

import com.example.backend.legacy.entity.Subasta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubastaRepository extends JpaRepository<Subasta, Integer> {

    @Query("""
            SELECT s FROM Subasta s
            WHERE s.categoria IN :allowed
              AND (:estado    IS NULL OR s.estado    = :estado)
              AND (:moneda    IS NULL OR s.moneda    = :moneda)
              AND (:categoria IS NULL OR s.categoria = :categoria)
            """)
    Page<Subasta> search(@Param("allowed") List<String> allowed,
                         @Param("estado") String estado,
                         @Param("moneda") String moneda,
                         @Param("categoria") String categoria,
                         Pageable pageable);
}
