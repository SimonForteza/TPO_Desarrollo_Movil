package com.example.backend.subastas.repository;

import com.example.backend.subastas.entity.LoteRemate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoteRemateRepository extends JpaRepository<LoteRemate, Long> {

    Optional<LoteRemate> findByItemId(Integer itemId);
}
