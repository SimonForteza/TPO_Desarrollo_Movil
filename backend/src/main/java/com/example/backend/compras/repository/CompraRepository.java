package com.example.backend.compras.repository;

import com.example.backend.compras.entity.Compra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CompraRepository extends JpaRepository<Compra, Long> {

    Page<Compra> findByUsuarioId(Long usuarioId, Pageable pageable);

    List<Compra> findByUsuarioId(Long usuarioId);

    Optional<Compra> findByIdAndUsuarioId(Long id, Long usuarioId);

    boolean existsByItemId(Integer itemId);

    long countByUsuarioId(Long usuarioId);

    /** Compras ganadas y efectivamente pagadas (para la métrica "Gastado"). */
    @Query("""
        SELECT COALESCE(SUM(c.montoFinal + c.comision + c.costoEnvio), 0)
        FROM Compra c
        WHERE c.usuarioId = :usuarioId AND c.estado = 'pagada'
        """)
    BigDecimal sumTotalPagadoByUsuario(@Param("usuarioId") Long usuarioId);

    /** Compras pendientes cuyo plazo de pago ya venció (para generar multas de forma lazy). */
    @Query("""
        SELECT c FROM Compra c
        WHERE c.usuarioId = :usuarioId
          AND c.estado = 'pendiente'
          AND c.pagarAntesDe IS NOT NULL
          AND c.pagarAntesDe < :ahora
        """)
    List<Compra> findVencidasSinPago(@Param("usuarioId") Long usuarioId,
                                     @Param("ahora") LocalDateTime ahora);
}
