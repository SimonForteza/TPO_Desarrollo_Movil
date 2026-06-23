package com.example.backend.subastas.repository;

import com.example.backend.legacy.entity.ItemCatalogo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {

    Page<ItemCatalogo> findByCatalogoSubastaIdentificador(Integer subastaId, Pageable pageable);

    List<ItemCatalogo> findByCatalogoSubastaIdentificador(Integer subastaId);

    Optional<ItemCatalogo> findByIdentificadorAndCatalogoSubastaIdentificador(Integer itemId, Integer subastaId);

    /**
     * "Claim" atómico del cierre de un lote: lo marca subastado solo si todavía no lo está.
     * Devuelve 1 si esta transacción ganó el cierre, 0 si otra ya lo había cerrado. Serializa
     * cierres concurrentes (dos clientes martillando el mismo lote a la vez) sin duplicar ventas.
     */
    @Modifying
    @Query("UPDATE ItemCatalogo i SET i.subastado = 'si' " +
           "WHERE i.identificador = :id AND (i.subastado IS NULL OR i.subastado <> 'si')")
    int marcarSubastado(@Param("id") Integer id);
}
