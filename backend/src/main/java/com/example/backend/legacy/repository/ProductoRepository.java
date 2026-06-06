package com.example.backend.legacy.repository;

import com.example.backend.legacy.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {}
