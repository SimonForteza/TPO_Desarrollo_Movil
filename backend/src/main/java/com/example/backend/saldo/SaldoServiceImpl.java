package com.example.backend.saldo;

import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Implementación real de {@link SaldoService} basada en {@code MedioDePago.saldo}.
 * Al estar anotada con {@code @Service}, reemplaza automáticamente el stub permisivo
 * registrado por {@link SaldoConfig} (que usa {@code @ConditionalOnMissingBean}).
 */
@Service
@Transactional
public class SaldoServiceImpl implements SaldoService {

    private final MedioDePagoRepository medioDePagoRepository;

    public SaldoServiceImpl(MedioDePagoRepository medioDePagoRepository) {
        this.medioDePagoRepository = medioDePagoRepository;
    }

    @Override
    public boolean alcanza(Long usuarioId, Long medioPagoId, BigDecimal monto) {
        MedioDePago medio = medioDePagoRepository.findByIdAndUsuarioId(medioPagoId, usuarioId)
                .orElse(null);
        if (medio == null || medio.getSaldo() == null) return false;
        return medio.getSaldo().compareTo(monto) >= 0;
    }

    @Override
    public void debitar(Long usuarioId, Long medioPagoId, BigDecimal monto) {
        MedioDePago medio = medioDePagoRepository.findByIdAndUsuarioId(medioPagoId, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment method not found: " + medioPagoId));
        if (medio.getSaldo() == null || medio.getSaldo().compareTo(monto) < 0) {
            throw new BusinessRuleException("Insufficient balance in payment method");
        }
        medio.setSaldo(medio.getSaldo().subtract(monto));
        medioDePagoRepository.save(medio);
    }
}
