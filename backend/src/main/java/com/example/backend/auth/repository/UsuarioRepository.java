package com.example.backend.auth.repository;

import com.example.backend.auth.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Método existente
    Optional<Usuario> findByEmail(String email);

    // Verificar si existe por email (booleano es más rápido que Optional)
    boolean existsByEmail(String email);
}