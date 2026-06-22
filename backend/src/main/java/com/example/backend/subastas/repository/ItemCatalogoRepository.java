package com.example.backend.subastas.repository;

import com.example.backend.legacy.entity.ItemCatalogo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {

    Page<ItemCatalogo> findByCatalogoSubastaIdentificador(Integer subastaId, Pageable pageable);

    List<ItemCatalogo> findByCatalogoSubastaIdentificador(Integer subastaId);

    Optional<ItemCatalogo> findByIdentificadorAndCatalogoSubastaIdentificador(Integer itemId, Integer subastaId);
}
