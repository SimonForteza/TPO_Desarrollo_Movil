package com.example.backend.mediosdepago;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.mediosdepago.dto.MedioDePagoRequest;
import com.example.backend.mediosdepago.dto.MedioDePagoResponse;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.ConflictException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.AsistenteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedioDePagoService {

    private final MedioDePagoRepository medioDePagoRepository;
    private final AsistenteRepository asistenteRepository;

    public MedioDePagoService(MedioDePagoRepository medioDePagoRepository,
                              AsistenteRepository asistenteRepository) {
        this.medioDePagoRepository = medioDePagoRepository;
        this.asistenteRepository = asistenteRepository;
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
        medio.setEstado("pendiente");
        medio.setDatosEnmascarados(mask(req.numero()));
        medioDePagoRepository.save(medio);
        return toResponse(medio);
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
                m.getEstado(), m.getDatosEnmascarados());
    }

    private String mask(String numero) {
        int visible = 4;
        if (numero.length() <= visible) return numero;
        return "*".repeat(numero.length() - visible) + numero.substring(numero.length() - visible);
    }
}
