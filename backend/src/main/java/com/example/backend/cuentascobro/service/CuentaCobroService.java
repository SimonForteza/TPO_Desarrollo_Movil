package com.example.backend.cuentascobro.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.cuentascobro.dto.CuentaCobroRequest;
import com.example.backend.cuentascobro.dto.CuentaCobroResponse;
import com.example.backend.cuentascobro.entity.CuentaCobro;
import com.example.backend.cuentascobro.repository.CuentaCobroRepository;
import com.example.backend.shared.dto.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CuentaCobroService {

    private final CuentaCobroRepository cuentaCobroRepository;

    public CuentaCobroService(CuentaCobroRepository cuentaCobroRepository) {
        this.cuentaCobroRepository = cuentaCobroRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<CuentaCobroResponse> list(Usuario usuario, Pageable pageable) {
        Page<CuentaCobro> page = cuentaCobroRepository.findByUsuarioId(usuario.getId(), pageable);
        List<CuentaCobroResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public CuentaCobroResponse create(Usuario usuario, CuentaCobroRequest req) {
        CuentaCobro cuenta = new CuentaCobro();
        cuenta.setUsuarioId(usuario.getId());
        cuenta.setBanco(req.banco());
        cuenta.setPais(req.pais());
        cuenta.setNumeroCuenta(req.numeroCuenta());
        cuentaCobroRepository.save(cuenta);
        return toResponse(cuenta);
    }

    private CuentaCobroResponse toResponse(CuentaCobro c) {
        return new CuentaCobroResponse(c.getId(), c.getBanco(), c.getPais(), c.getNumeroCuenta());
    }
}
