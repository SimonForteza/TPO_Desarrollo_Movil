package com.example.backend.subastas.controller;

import com.example.backend.bienes.entity.BienEnConsignacion;
import com.example.backend.bienes.repository.BienRepository;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.legacy.entity.*;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.subastas.dto.CierreSubastaResponse;
import com.example.backend.subastas.dto.CrearSubastaRequest;
import com.example.backend.subastas.dto.CrearSubastaResponse;
import com.example.backend.subastas.service.CierreSubastaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Endpoints administrativos de subastas, pensados para Swagger/Postman.
 * Requieren autenticación (caen bajo anyRequest().authenticated()); no hay rol admin dedicado.
 */
@RestController
@RequestMapping("/admin/subastas")
@Tag(name = "Admin auctions", description = "Auction lifecycle operations (closing) for staff")
public class AdminSubastaController {

    private static final Set<String> CATEGORIAS_VALIDAS = Set.of("comun", "especial", "plata", "oro", "platino");
    private static final Set<String> MONEDAS_VALIDAS    = Set.of("ARS", "USD");
    private static final String UBICACION_DEFAULT       = "Palais de Glace, CABA";
    private static final int DIAS_MINIMOS               = 10;
    private static final int DIAS_DEFAULT               = 15;

    private final CierreSubastaService cierreSubastaService;
    private final BienRepository bienRepository;

    @PersistenceContext
    private EntityManager em;

    public AdminSubastaController(CierreSubastaService cierreSubastaService,
                                  BienRepository bienRepository) {
        this.cierreSubastaService = cierreSubastaService;
        this.bienRepository = bienRepository;
    }

    @PostMapping
    @Transactional
    @Operation(summary = "Create an auction from all currently approved available goods")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Auction created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid categoria or moneda"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "No approved goods available, or missing seeder data")
    })
    public ResponseEntity<ApiResponse<CrearSubastaResponse>> crear(@Valid @RequestBody CrearSubastaRequest req) {
        if (!CATEGORIAS_VALIDAS.contains(req.categoria())) {
            throw new IllegalArgumentException("Invalid categoria. Valid values: " + CATEGORIAS_VALIDAS);
        }
        if (!MONEDAS_VALIDAS.contains(req.moneda())) {
            throw new IllegalArgumentException("Invalid moneda. Valid values: " + MONEDAS_VALIDAS);
        }

        List<BienEnConsignacion> disponibles =
                bienRepository.findByEstadoAndSubastaIdIsNull(EstadoBien.ESPERANDO_SUBASTA);
        if (disponibles.isEmpty()) {
            throw new BusinessRuleException("No hay bienes esperando subasta para crear una subasta");
        }

        // Si se especifican bienIds, se usan solo esos (validando que estén disponibles);
        // si no, se incluyen todos los bienes que esperan ser incluidos en una subasta.
        List<BienEnConsignacion> bienes;
        if (req.bienIds() != null && !req.bienIds().isEmpty()) {
            Set<Long> idsPedidos = new HashSet<>(req.bienIds());
            Set<Long> idsDisponibles = disponibles.stream()
                    .map(BienEnConsignacion::getId).collect(Collectors.toSet());
            List<Long> invalidos = idsPedidos.stream()
                    .filter(id -> !idsDisponibles.contains(id)).sorted().toList();
            if (!invalidos.isEmpty()) {
                throw new BusinessRuleException(
                        "Estos bienes no están disponibles (no existen, no aceptados, o ya asignados): " + invalidos);
            }
            bienes = disponibles.stream()
                    .filter(b -> idsPedidos.contains(b.getId())).toList();
        } else {
            bienes = disponibles;
        }

        Subastador subastador;
        Empleado empleado;
        try {
            subastador = em.createQuery("select s from Subastador s", Subastador.class)
                    .setMaxResults(1).getSingleResult();
            empleado = em.createQuery("select e from Empleado e", Empleado.class)
                    .setMaxResults(1).getSingleResult();
        } catch (NoResultException e) {
            throw new BusinessRuleException("No hay subastador/empleado registrado. Ejecutá el seeder primero.");
        }

        int dias = (req.diasHastaFecha() != null) ? Math.max(req.diasHastaFecha(), DIAS_MINIMOS) : DIAS_DEFAULT;
        String ubicacion = (req.ubicacion() != null && !req.ubicacion().isBlank()) ? req.ubicacion() : UBICACION_DEFAULT;

        Subasta subasta = new Subasta();
        subasta.setFecha(LocalDate.now().plusDays(dias));
        subasta.setHora(LocalTime.of(18, 0));
        subasta.setEstado("abierta");
        subasta.setCategoria(req.categoria());
        subasta.setMoneda(req.moneda());
        subasta.setUbicacion(ubicacion);
        subasta.setCapacidadAsistentes(100);
        subasta.setTieneDeposito("si");
        subasta.setSeguridadPropia("si");
        subasta.setSubastador(subastador);
        em.persist(subasta);
        em.flush();

        Catalogo catalogo = new Catalogo();
        catalogo.setDescripcion("Catálogo " + req.categoria());
        catalogo.setSubasta(subasta);
        catalogo.setResponsable(empleado);
        em.persist(catalogo);

        List<String> nombresProductos = new ArrayList<>();
        for (BienEnConsignacion bien : bienes) {
            Producto producto = em.find(Producto.class, bien.getProductoId());
            if (producto == null) continue;

            ItemCatalogo item = new ItemCatalogo();
            item.setCatalogo(catalogo);
            item.setProducto(producto);
            item.setPrecioBase(bien.getPrecioBasePropuesto() != null
                    ? bien.getPrecioBasePropuesto() : BigDecimal.ZERO);
            item.setComision(bien.getComisionPropuesta() != null
                    ? bien.getComisionPropuesta() : BigDecimal.ZERO);
            item.setSubastado("no");
            em.persist(item);

            bien.setEstado(EstadoBien.ASIGNADO);
            bien.setSubastaId(subasta.getIdentificador());

            producto.setDisponible("no");

            nombresProductos.add(producto.getDescripcionCatalogo());
        }

        CrearSubastaResponse response = new CrearSubastaResponse(
                subasta.getIdentificador(),
                subasta.getCategoria(),
                subasta.getMoneda(),
                subasta.getFecha(),
                subasta.getUbicacion(),
                nombresProductos.size(),
                nombresProductos
        );
        return ResponseEntity.status(201).body(ApiResponse.ok("Auction created successfully", response));
    }

    @PostMapping("/{id}/cerrar")
    @Operation(summary = "Close an auction: pick winners, generate purchases and register sales")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Auction closed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Auction not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Auction is not open")
    })
    public ResponseEntity<ApiResponse<CierreSubastaResponse>> cerrar(@PathVariable Integer id) {
        CierreSubastaResponse result = cierreSubastaService.cerrar(id);
        return ResponseEntity.ok(ApiResponse.ok("Auction closed", result));
    }
}
