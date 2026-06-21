package com.example.backend.pujas.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.legacy.entity.Asistente;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Pujo;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.repository.ClienteRepository;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.multas.repository.MultaRepository;
import com.example.backend.pujas.dto.PujaHistoryItem;
import com.example.backend.pujas.dto.PujaRequest;
import com.example.backend.pujas.dto.PujaResponse;
import com.example.backend.pujas.repository.PujoRepository;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ForbiddenException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.AsistenteRepository;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import com.example.backend.subastas.repository.SubastaRepository;
import com.example.backend.subastas.util.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PujaService {

    private final SubastaRepository subastaRepository;
    private final ClienteRepository clienteRepository;
    private final AsistenteRepository asistenteRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final MedioDePagoRepository medioDePagoRepository;
    private final MultaRepository multaRepository;

    public PujaService(SubastaRepository subastaRepository,
                       ClienteRepository clienteRepository,
                       AsistenteRepository asistenteRepository,
                       ItemCatalogoRepository itemCatalogoRepository,
                       PujoRepository pujoRepository,
                       MedioDePagoRepository medioDePagoRepository,
                       MultaRepository multaRepository) {
        this.subastaRepository = subastaRepository;
        this.clienteRepository = clienteRepository;
        this.asistenteRepository = asistenteRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujoRepository = pujoRepository;
        this.medioDePagoRepository = medioDePagoRepository;
        this.multaRepository = multaRepository;
    }

    public PujaResponse pujar(Usuario usuario, Integer subastaId, PujaRequest req) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));

        if (!"abierta".equals(subasta.getEstado())) {
            throw new BusinessRuleException("Auction is not open for bidding");
        }

        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));

        if (!Categoria.from(cliente.getCategoria()).canAccess(subasta.getCategoria())) {
            throw new ForbiddenException("Your category does not allow access to this auction");
        }

        if (multaRepository.existsByUsuarioIdAndEstado(usuario.getId(), "pendiente")) {
            throw new ForbiddenException("You have pending fines that must be resolved before bidding");
        }

        Asistente asistente = asistenteRepository
                .findByClienteIdentificadorAndSubastaIdentificador(cliente.getIdentificador(), subastaId)
                .orElseThrow(() -> new ForbiddenException("You must be inscribed in this auction to bid"));

        ItemCatalogo item = itemCatalogoRepository
                .findByIdentificadorAndCatalogoSubastaIdentificador(req.itemId(), subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + req.itemId()));

        if ("si".equals(item.getSubastado())) {
            throw new BusinessRuleException("This item has already been sold");
        }

        MedioDePago medio = medioDePagoRepository.findByIdAndUsuarioId(req.medioPagoId(), usuario.getId())
                .orElseThrow(() -> new ForbiddenException("Payment method not found or not owned"));

        if (!"verificado".equals(medio.getEstado())) {
            throw new BusinessRuleException("Payment method is not verified");
        }

        if (!subasta.getMoneda().equals(medio.getMoneda())) {
            throw new BusinessRuleException("Payment method currency does not match auction currency");
        }

        BigDecimal mejorOferta = pujoRepository.findMaxImporteByItem(req.itemId());
        if (mejorOferta == null) mejorOferta = BigDecimal.ZERO;

        Categoria userCat = Categoria.from(cliente.getCategoria());
        boolean unlimited = userCat == Categoria.ORO || userCat == Categoria.PLATINO;

        if (unlimited) {
            if (req.importe().compareTo(mejorOferta) <= 0) {
                throw new BusinessRuleException("Bid must be higher than the current best offer");
            }
        } else {
            BigDecimal precioBase = item.getPrecioBase();
            BigDecimal min = mejorOferta.add(precioBase.multiply(new BigDecimal("0.01")));
            BigDecimal max = mejorOferta.add(precioBase.multiply(new BigDecimal("0.20")));
            if (req.importe().compareTo(min) < 0 || req.importe().compareTo(max) > 0) {
                throw new BusinessRuleException(
                        "Bid must be between " + min.toPlainString() + " and " + max.toPlainString());
            }
        }

        Pujo pujo = new Pujo();
        pujo.setAsistente(asistente);
        pujo.setItem(item);
        pujo.setImporte(req.importe());
        pujo.setGanador("no");
        pujoRepository.save(pujo);

        return new PujaResponse(
                pujo.getIdentificador(),
                pujo.getIdentificador(),
                req.importe(),
                req.itemId(),
                asistente.getIdentificador(),
                asistente.getNumeroPostor());
    }

    @Transactional(readOnly = true)
    public PagedResponse<PujaHistoryItem> historial(Usuario usuario, Integer subastaId, Pageable pageable) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));

        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));

        if (!Categoria.from(cliente.getCategoria()).canAccess(subasta.getCategoria())) {
            throw new ForbiddenException("Your category does not allow access to this auction");
        }

        Page<Pujo> page = pujoRepository.findHistoryBySubasta(subastaId, pageable);
        List<PujaHistoryItem> content = page.getContent().stream()
                .map(p -> new PujaHistoryItem(
                        p.getIdentificador(),
                        p.getIdentificador(),
                        p.getImporte(),
                        p.getItem().getIdentificador(),
                        p.getItem().getProducto().getDescripcionCatalogo(),
                        p.getAsistente().getIdentificador(),
                        p.getAsistente().getNumeroPostor()))
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
