package com.example.backend.legacy.repository;

import com.example.backend.legacy.entity.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {
    List<Foto> findByProductoIdentificador(Integer productoId);
}
