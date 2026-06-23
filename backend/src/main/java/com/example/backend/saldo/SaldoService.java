package com.example.backend.saldo;

import java.math.BigDecimal;

/**
 * Saldo / límite de los medios de pago del usuario.
 *
 * <p>La implementación real (tabla auxiliar que simula la plata asignada a las cuentas
 * externas del usuario y el límite del cheque certificado — consigna L68) la provee otro
 * integrante del equipo. Este módulo (compras / multas / pujas) solo <b>consume</b> esta
 * interfaz. Mientras no exista la implementación real, {@link SaldoConfig} registra un stub
 * permisivo (todo "alcanza") vía {@code @ConditionalOnMissingBean}, de modo que cuando el
 * compañero agregue su propio bean, este último toma precedencia automáticamente.
 */
public interface SaldoService {

    /** Indica si el medio de pago del usuario tiene saldo/cupo suficiente para {@code monto}. */
    boolean alcanza(Long usuarioId, Long medioPagoId, BigDecimal monto);

    /** Debita/reserva {@code monto} del medio de pago. No-op en cuentas/tarjetas sin límite. */
    void debitar(Long usuarioId, Long medioPagoId, BigDecimal monto);
}
