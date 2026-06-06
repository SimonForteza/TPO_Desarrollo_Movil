package com.example.backend.subastas.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.legacy.entity.Asistente;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.repository.ClienteRepository;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.multas.repository.MultaRepository;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ConflictException;
import com.example.backend.shared.exception.ForbiddenException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.dto.InscripcionRequest;
import com.example.backend.subastas.dto.InscripcionResponse;
import com.example.backend.subastas.repository.AsistenteRepository;
import com.example.backend.subastas.repository.SubastaRepository;
import com.example.backend.subastas.util.Categoria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class InscripcionService {

    private final SubastaRepository subastaRepository;
    private final ClienteRepository clienteRepository;
    private final AsistenteRepository asistenteRepository;
    private final MedioDePagoRepository medioDePagoRepository;
    private final MultaRepository multaRepository;

    public InscripcionService(SubastaRepository subastaRepository,
                              ClienteRepository clienteRepository,
                              AsistenteRepository asistenteRepository,
                              MedioDePagoRepository medioDePagoRepository,
                              MultaRepository multaRepository) {
        this.subastaRepository = subastaRepository;
        this.clienteRepository = clienteRepository;
        this.asistenteRepository = asistenteRepository;
        this.medioDePagoRepository = medioDePagoRepository;
        this.multaRepository = multaRepository;
    }

    public InscripcionResponse inscribir(Usuario usuario, Integer subastaId, InscripcionRequest req) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));

        if (!"abierta".equals(subasta.getEstado())) {
            throw new BusinessRuleException("Auction is not open for inscription");
        }

        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));

        if (!Categoria.from(cliente.getCategoria()).canAccess(subasta.getCategoria())) {
            throw new ForbiddenException("Your category does not allow access to this auction");
        }

        if (multaRepository.existsByUsuarioIdAndEstado(usuario.getId(), "pendiente")) {
            throw new ForbiddenException("You have pending fines that must be resolved before inscribing");
        }

        if (asistenteRepository.isUserInActiveAuction(cliente.getIdentificador())) {
            throw new ConflictException("You are already registered in an active auction");
        }

        MedioDePago medio = medioDePagoRepository.findByIdAndUsuarioId(req.medioPagoId(), usuario.getId())
                .orElseThrow(() -> new ForbiddenException("Payment method not found or not owned"));

        if (!"verificado".equals(medio.getEstado())) {
            throw new BusinessRuleException("Payment method is not verified");
        }

        if (!subasta.getMoneda().equals(medio.getMoneda())) {
            throw new BusinessRuleException("Payment method currency does not match auction currency");
        }

        int numeroPostor = (int) (asistenteRepository.countBySubastaIdentificador(subastaId) + 1);

        Asistente asistente = new Asistente();
        asistente.setCliente(cliente);
        asistente.setSubasta(subasta);
        asistente.setNumeroPostor(numeroPostor);
        asistente.setMedioPagoId(req.medioPagoId());
        asistenteRepository.save(asistente);

        return new InscripcionResponse(
                asistente.getIdentificador(),
                numeroPostor,
                subastaId,
                LocalDateTime.now());
    }
}
