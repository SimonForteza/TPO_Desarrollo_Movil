package com.example.backend.dev;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.auth.repository.UsuarioRepository;
import com.example.backend.legacy.entity.*;
import com.example.backend.legacy.repository.ClienteRepository;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.pujas.repository.PujoRepository;
import com.example.backend.shared.dto.ApiResponse;
import com.example.backend.subastas.repository.AsistenteRepository;
import com.example.backend.subastas.repository.CatalogoRepository;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import com.example.backend.subastas.repository.SubastaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/dev")
@Profile("dev")
public class DevController {

    @PersistenceContext
    private EntityManager em;

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PujoRepository pujoRepository;
    private final AsistenteRepository asistenteRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final CatalogoRepository catalogoRepository;
    private final SubastaRepository subastaRepository;
    private final MedioDePagoRepository medioDePagoRepository;

    public DevController(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
                         PujoRepository pujoRepository, AsistenteRepository asistenteRepository,
                         ItemCatalogoRepository itemCatalogoRepository, CatalogoRepository catalogoRepository,
                         SubastaRepository subastaRepository, MedioDePagoRepository medioDePagoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.pujoRepository = pujoRepository;
        this.asistenteRepository = asistenteRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.catalogoRepository = catalogoRepository;
        this.subastaRepository = subastaRepository;
        this.medioDePagoRepository = medioDePagoRepository;
    }

    /**
     * Marks all active users' clients as admitted so they can see prices and bid.
     * Only available in dev profile.
     */
    @PostMapping("/admitir-todos")
    public ResponseEntity<ApiResponse<String>> admitirTodos() {
        List<Usuario> activos = usuarioRepository.findAll().stream()
                .filter(u -> "activo".equals(u.getEstadoKyc()))
                .toList();

        int count = 0;
        for (Usuario u : activos) {
            if (u.getClienteId() == null) continue;
            java.util.Optional<Cliente> opt = clienteRepository.findById(u.getClienteId());
            if (opt.isPresent() && !"si".equals(opt.get().getAdmitido())) {
                opt.get().setAdmitido("si");
                count++;
            }
        }

        return ResponseEntity.ok(ApiResponse.ok("Done", count + " clients marked as admitted"));
    }

    @PostMapping("/limpiar-pujas")
    public ResponseEntity<ApiResponse<String>> limpiarPujas() {
        long count = pujoRepository.count();
        pujoRepository.deleteAll();
        return ResponseEntity.ok(ApiResponse.ok("Done", count + " bids deleted"));
    }

    @PostMapping("/reset-subastas")
    @Transactional
    public ResponseEntity<ApiResponse<String>> resetSubastas() {
        // Delete in FK order (skip Producto — may have FK deps like Fotos/Bienes)
        pujoRepository.deleteAll();
        asistenteRepository.deleteAll();
        itemCatalogoRepository.deleteAll();
        catalogoRepository.deleteAll();
        subastaRepository.deleteAll();
        em.flush();

        // Recover existing seeder entities
        Empleado empleado = em.createQuery("SELECT e FROM Empleado e", Empleado.class)
                .setMaxResults(1).getSingleResult();
        Duenio duenio = em.createQuery("SELECT d FROM Duenio d", Duenio.class)
                .setMaxResults(1).getSingleResult();
        Subastador subastador = em.createQuery("SELECT s FROM Subastador s", Subastador.class)
                .setMaxResults(1).getSingleResult();
        Seguro seguro = em.createQuery("SELECT s FROM Seguro s", Seguro.class)
                .setMaxResults(1).getSingleResult();

        // Create fresh subasta comun/ARS with 2 items
        Subasta s1 = new Subasta();
        s1.setFecha(LocalDate.now().plusDays(1));
        s1.setHora(LocalTime.of(18, 0));
        s1.setEstado("abierta");
        s1.setCategoria("comun");
        s1.setMoneda("ARS");
        s1.setUbicacion("Palais de Glace, CABA");
        s1.setCapacidadAsistentes(100);
        s1.setTieneDeposito("si");
        s1.setSeguridadPropia("si");
        s1.setSubastador(subastador);
        em.persist(s1);
        em.flush();

        Catalogo cat1 = new Catalogo();
        cat1.setDescripcion("Catálogo comun");
        cat1.setSubasta(s1);
        cat1.setResponsable(empleado);
        em.persist(cat1);

        agregarItem(cat1, "Pintura al óleo S.XIX", empleado, duenio, seguro,
                new BigDecimal("15000.00"), new BigDecimal("1500.00"));
        agregarItem(cat1, "Acuarela paisaje pampeano", empleado, duenio, seguro,
                new BigDecimal("8000.00"), new BigDecimal("800.00"));
        agregarItem(cat1, "Grabado en cobre circa 1890", empleado, duenio, null,
                new BigDecimal("5000.00"), new BigDecimal("500.00"));

        // Create fresh subasta especial/ARS with 2 items
        Subasta s2 = new Subasta();
        s2.setFecha(LocalDate.now().plusDays(5));
        s2.setHora(LocalTime.of(19, 0));
        s2.setEstado("abierta");
        s2.setCategoria("especial");
        s2.setMoneda("ARS");
        s2.setUbicacion("Centro Cultural Recoleta, CABA");
        s2.setCapacidadAsistentes(50);
        s2.setTieneDeposito("si");
        s2.setSeguridadPropia("no");
        s2.setSubastador(subastador);
        em.persist(s2);
        em.flush();

        Catalogo cat2 = new Catalogo();
        cat2.setDescripcion("Catálogo especial");
        cat2.setSubasta(s2);
        cat2.setResponsable(empleado);
        em.persist(cat2);

        agregarItem(cat2, "Escultura bronce modernista", empleado, duenio, seguro,
                new BigDecimal("80000.00"), new BigDecimal("8000.00"));
        agregarItem(cat2, "Jarrón porcelana Art Nouveau", empleado, duenio, null,
                new BigDecimal("45000.00"), new BigDecimal("4500.00"));

        em.flush();

        // Re-enroll test user in s1
        Usuario testUser = usuarioRepository.findByEmail("test@subastapro.com").orElse(null);
        if (testUser != null) {
            clienteRepository.findById(testUser.getClienteId()).ifPresent(cliente -> {
                MedioDePago medio = medioDePagoRepository.findAll().stream()
                        .filter(m -> m.getUsuarioId().equals(testUser.getId()) && "verificado".equals(m.getEstado()))
                        .findFirst().orElse(null);
                if (medio != null) {
                    Asistente a = new Asistente();
                    a.setCliente(cliente);
                    a.setSubasta(s1);
                    a.setNumeroPostor(1);
                    a.setMedioPagoId(medio.getId());
                    em.persist(a);
                }
            });
        }

        em.flush();
        return ResponseEntity.ok(ApiResponse.ok("Done", "Reset complete — 2 subastas, 5 items total"));
    }

    private void agregarItem(Catalogo catalogo, String descripcion, Empleado empleado,
                              Duenio duenio, Seguro seguro, BigDecimal precioBase, BigDecimal comision) {
        Producto p = new Producto();
        p.setFecha(LocalDate.now());
        p.setDisponible("si");
        p.setDescripcionCatalogo(descripcion);
        p.setDescripcionCompleta(descripcion + " — pieza única verificada.");
        p.setRevisor(empleado);
        p.setDuenio(duenio);
        p.setSeguro(seguro);
        em.persist(p);
        em.flush();

        ItemCatalogo item = new ItemCatalogo();
        item.setCatalogo(catalogo);
        item.setProducto(p);
        item.setPrecioBase(precioBase);
        item.setComision(comision);
        item.setSubastado("no");
        em.persist(item);
    }
}
