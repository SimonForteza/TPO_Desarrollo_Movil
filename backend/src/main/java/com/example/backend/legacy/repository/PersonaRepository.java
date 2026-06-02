package com.example.backend.legacy.repository;

import com.example.backend.legacy.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    boolean existsByDocumento(String documento);
}
