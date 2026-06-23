package com.example.backend.bienes.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.bienes.dto.*;
import com.example.backend.bienes.entity.BienEnConsignacion;
import com.example.backend.bienes.repository.BienRepository;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.cuentascobro.repository.CuentaCobroRepository;
import com.example.backend.legacy.entity.*;
import com.example.backend.legacy.repository.*;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class BienService {

    private static final Set<String> ESTADOS_CON_UBICACION =
            Set.of(EstadoBien.APROBADO, EstadoBien.ASIGNADO, EstadoBien.VENDIDO);

    private final BienRepository bienRepository;
    private final ClienteRepository clienteRepository;
    private final DuenioRepository duenioRepository;
    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final CuentaCobroRepository cuentaCobroRepository;
    private final BienMapper bienMapper;

    public BienService(BienRepository bienRepository,
                       ClienteRepository clienteRepository,
                       DuenioRepository duenioRepository,
                       ProductoRepository productoRepository,
                       FotoRepository fotoRepository,
                       CuentaCobroRepository cuentaCobroRepository,
                       BienMapper bienMapper) {
        this.bienRepository = bienRepository;
        this.clienteRepository = clienteRepository;
        this.duenioRepository = duenioRepository;
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.cuentaCobroRepository = cuentaCobroRepository;
        this.bienMapper = bienMapper;
    }

    @Transactional(readOnly = true)
    public PagedResponse<BienListItem> list(Usuario usuario, Pageable pageable) {
        Page<BienEnConsignacion> page = bienRepository.findByUsuarioId(usuario.getId(), pageable);
        List<BienListItem> content = page.getContent().stream()
                .map(bienMapper::toListItem)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public BienDetail solicitar(Usuario usuario, BienRequest req) {
        if (!cuentaCobroRepository.existsByUsuarioId(usuario.getId())) {
            throw new BusinessRuleException(
                    "Debes declarar al menos una cuenta de cobro antes de consignar un bien");
        }

        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));

        Duenio duenio = duenioRepository.findById(cliente.getIdentificador()).orElseGet(() -> {
            Duenio d = new Duenio();
            d.setPersona(cliente.getPersona());
            d.setPais(cliente.getPais());
            d.setVerificacionFinanciera("no");
            d.setVerificacionJudicial("no");
            d.setCalificacionRiesgo(1);
            d.setVerificador(cliente.getVerificador());
            return duenioRepository.saveAndFlush(d);
        });

        Producto producto = new Producto();
        producto.setFecha(LocalDate.now());
        producto.setDisponible("no");
        producto.setDescripcionCatalogo(req.descripcion());
        producto.setDescripcionCompleta(req.descripcionCompleta());
        producto.setRevisor(cliente.getVerificador());
        producto.setDuenio(duenio);
        producto.setSeguro(null);
        productoRepository.saveAndFlush(producto);

        if (req.fotos() == null || req.fotos().size() < 6) {
            throw new BusinessRuleException("Se requieren exactamente 6 fotos del bien");
        }

        Base64.Decoder decoder = Base64.getDecoder();
        for (String b64 : req.fotos()) {
            Foto foto = new Foto();
            foto.setProducto(producto);
            foto.setFoto(decoder.decode(b64));
            fotoRepository.save(foto);
        }

        BienEnConsignacion bien = new BienEnConsignacion();
        bien.setUsuarioId(usuario.getId());
        bien.setProductoId(producto.getIdentificador());
        bien.setEstado(EstadoBien.PENDIENTE_REVISION);
        bien.setDeclaracionPropiedad(true);
        bien.setOrigenLicitoAcreditado(true);
        bienRepository.save(bien);

        return bienMapper.toDetail(bien);
    }

    @Transactional(readOnly = true)
    public BienDetail detail(Usuario usuario, Long id) {
        BienEnConsignacion bien = bienRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Consignment not found: " + id));
        return bienMapper.toDetail(bien);
    }

    public BienDetail aceptarCondiciones(Usuario usuario, Long id, AceptarCondicionesRequest req) {
        BienEnConsignacion bien = bienRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Consignment not found: " + id));

        if (!EstadoBien.APROBADO.equals(bien.getEstado())
                || bien.getPrecioBasePropuesto() == null
                || bien.getComisionPropuesta() == null) {
            throw new BusinessRuleException(
                    "Consignment must be in 'aprobado' state with proposed price and commission set");
        }

        bien.setEstado(Boolean.TRUE.equals(req.acepta()) ? EstadoBien.ASIGNADO : EstadoBien.RECHAZADO);
        bienRepository.save(bien);

        return bienMapper.toDetail(bien);
    }

    @Transactional(readOnly = true)
    public UbicacionPolizaResponse ubicacionPoliza(Usuario usuario, Long id) {
        BienEnConsignacion bien = bienRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Consignment not found: " + id));

        if (!ESTADOS_CON_UBICACION.contains(bien.getEstado())) {
            throw new ResourceNotFoundException("Location not available yet for consignment: " + id);
        }

        Producto producto = productoRepository.findById(bien.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        SeguroSummary seguroSummary = bienMapper.toSeguroSummary(producto.getSeguro());
        return new UbicacionPolizaResponse(bien.getUbicacionDeposito(), seguroSummary);
    }
}
