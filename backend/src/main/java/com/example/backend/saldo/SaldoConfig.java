package com.example.backend.saldo;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

/**
 * Stub temporal de {@link SaldoService}. Se registra SOLO si nadie más definió un bean de
 * {@link SaldoService} ({@code @ConditionalOnMissingBean}), así la implementación real del
 * compañero (tabla auxiliar de saldo + límite de cheque) lo reemplaza sin tocar este archivo.
 */
@Configuration
public class SaldoConfig {

    @Bean
    @ConditionalOnMissingBean(SaldoService.class)
    public SaldoService saldoServiceStub() {
        return new SaldoService() {
            @Override
            public boolean alcanza(Long usuarioId, Long medioPagoId, BigDecimal monto) {
                return true; // stub: sin módulo de saldo, todo "alcanza"
            }

            @Override
            public void debitar(Long usuarioId, Long medioPagoId, BigDecimal monto) {
                // stub: no-op
            }
        };
    }
}
