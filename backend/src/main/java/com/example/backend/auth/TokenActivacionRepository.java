package com.example.backend.auth;

import com.example.backend.auth.entity.TokenActivacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenActivacionRepository extends JpaRepository<TokenActivacion, Long> {
    Optional<TokenActivacion> findByTokenAndUsadoFalse(String token);
}
