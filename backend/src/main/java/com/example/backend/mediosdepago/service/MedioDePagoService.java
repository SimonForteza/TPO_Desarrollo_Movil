package com.example.backend.mediosdepago.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.categorias.service.CategoriaUsuarioService;
import com.example.backend.mediosdepago.dto.MedioDePagoRequest;
import com.example.backend.mediosdepago.dto.MedioDePagoResponse;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ConflictException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.AsistenteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedioDePagoService {

    private final MedioDePagoRepository medioDePagoRepository;
    private final AsistenteRepository asistenteRepository;
    private final CategoriaUsuarioService categoriaUsuarioService;

    public MedioDePagoService(MedioDePagoRepository medioDePagoRepository,
                              AsistenteRepository asistenteRepository,
                              CategoriaUsuarioService categoriaUsuarioService) {
        this.medioDePagoRepository = medioDePagoRepository;
        this.asistenteRepository = asistenteRepository;
        this.categoriaUsuarioService = categoriaUsuarioService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<MedioDePagoResponse> list(Usuario usuario, Pageable pageable) {
        Page<MedioDePago> page = medioDePagoRepository.findByUsuarioId(usuario.getId(), pageable);
        List<MedioDePagoResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public MedioDePagoResponse create(Usuario usuario, MedioDePagoRequest req) {
        MedioDePago medio = new MedioDePago();
        medio.setUsuarioId(usuario.getId());
        medio.setTipo(req.tipo());
        medio.setMoneda(req.moneda());
        medio.setEstado("verificado");
        medio.setDatosEnmascarados(mask(req.numero()));
        medio.setSaldo(resolveSaldo(req));
        medioDePagoRepository.save(medio);
        // El medio se verifica al instante (mock): un nuevo tipo verificado puede mejorar la categoría.
        categoriaUsuarioService.recalcular(usuario);
        return toResponse(medio);
    }

    // Cheque: el usuario declara el monto certificado. Cuenta y tarjeta: saldo por defecto según moneda.
    private BigDecimal resolveSaldo(MedioDePagoRequest req) {
        if ("cheque".equals(req.tipo())) {
            if (req.monto() == null || req.monto().signum() <= 0) {
                throw new BusinessRuleException("Cheque amount is required and must be positive");
            }
            return req.monto();
        }
        return "USD".equals(req.moneda()) ? new BigDecimal("1000") : new BigDecimal("1000000");
    }

    public void delete(Usuario usuario, Long id) {
        MedioDePago medio = medioDePagoRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment method not found: " + id));

        if (asistenteRepository.isMedioInActiveAuction(id)) {
            throw new ConflictException("Payment method is in use in an active auction");
        }

        medioDePagoRepository.delete(medio);
    }

    private MedioDePagoResponse toResponse(MedioDePago m) {
        return new MedioDePagoResponse(m.getId(), m.getTipo(), m.getMoneda(),
                m.getEstado(), m.getDatosEnmascarados(), m.getSaldo());
    }

    private String mask(String numero) {
        int visible = 4;
        if (numero.length() <= visible) return numero;
        return "*".repeat(numero.length() - visible) + numero.substring(numero.length() - visible);
    }
}
