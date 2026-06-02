package com.example.backend.dev;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.legacy.entity.*;
import com.example.backend.mediosdepago.entity.MedioDePago;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    private final PasswordEncoder passwordEncoder;

    public DevDataSeeder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Long count = em.createQuery("SELECT COUNT(s) FROM Subasta s", Long.class).getSingleResult();
        if (count > 0) return;

        // Paises
        Pais argentina = new Pais();
        argentina.setNumero(32);
        argentina.setNombre("Argentina");
        argentina.setNombreCorto("AR");
        argentina.setCapital("Buenos Aires");
        argentina.setNacionalidad("Argentino");
        argentina.setIdiomas("Español");
        em.persist(argentina);

        // Sector
        Sector sector = new Sector();
        sector.setNombreSector("Operaciones");
        sector.setCodigoSector("OPS");
        em.persist(sector);
        em.flush();

        // Empleado
        Persona pEmpleado = new Persona();
        pEmpleado.setNombre("Admin Sistema");
        pEmpleado.setDocumento("11111111");
        pEmpleado.setDireccion("Av. Corrientes 1234, CABA");
        pEmpleado.setEstado("activo");
        em.persist(pEmpleado);
        em.flush();

        Empleado empleado = new Empleado();
        empleado.setIdentificador(pEmpleado.getIdentificador());
        empleado.setPersona(pEmpleado);
        empleado.setCargo("Operaciones");
        empleado.setSector(sector.getIdentificador());
        em.persist(empleado);

        sector.setResponsableSector(empleado);
        em.flush();

        // Subastador
        Persona pSubastador = new Persona();
        pSubastador.setNombre("Carlos Martínez");
        pSubastador.setDocumento("22222222");
        pSubastador.setDireccion("Av. Santa Fe 800, CABA");
        pSubastador.setEstado("activo");
        em.persist(pSubastador);
        em.flush();

        Subastador subastador = new Subastador();
        subastador.setIdentificador(pSubastador.getIdentificador());
        subastador.setPersona(pSubastador);
        subastador.setMatricula("MAT-001");
        subastador.setRegion("Buenos Aires");
        em.persist(subastador);

        // Duenio
        Persona pDuenio = new Persona();
        pDuenio.setNombre("Roberto Fernandez");
        pDuenio.setDocumento("33333333");
        pDuenio.setDireccion("Palermo, CABA");
        pDuenio.setEstado("activo");
        em.persist(pDuenio);
        em.flush();

        Duenio duenio = new Duenio();
        duenio.setIdentificador(pDuenio.getIdentificador());
        duenio.setPersona(pDuenio);
        duenio.setPais(argentina);
        duenio.setVerificacionFinanciera("si");
        duenio.setVerificacionJudicial("si");
        duenio.setCalificacionRiesgo(1);
        duenio.setVerificador(empleado);
        em.persist(duenio);

        // Seguros
        Seguro seguro = new Seguro();
        seguro.setNroPoliza("POL-001-2026");
        seguro.setCompania("Mapfre");
        seguro.setPolizaCombinada("si");
        seguro.setImporte(new BigDecimal("50000.00"));
        em.persist(seguro);
        em.flush();

        // Productos
        Producto prod1 = crearProducto("Pintura al óleo S.XIX", "https://cdn.subastas.com/pdfs/prod1.pdf",
                empleado, duenio, seguro);
        Producto prod2 = crearProducto("Escultura bronce modernista", "https://cdn.subastas.com/pdfs/prod2.pdf",
                empleado, duenio, null);
        Producto prod3 = crearProducto("Reloj de bolsillo Patek Philippe", "https://cdn.subastas.com/pdfs/prod3.pdf",
                empleado, duenio, seguro);

        // Subastas
        Subasta s1 = crearSubasta(LocalDate.now().plusDays(15), "comun", "ARS", "Palais de Glace, CABA", subastador);
        Subasta s2 = crearSubasta(LocalDate.now().plusDays(20), "especial", "ARS", "Centro Cultural Recoleta, CABA", subastador);
        Subasta s3 = crearSubasta(LocalDate.now().plusDays(30), "oro", "USD", "Hotel Alvear, CABA", subastador);
        em.flush();

        // Catalogos e items
        crearCatalogoConItems(s1, empleado, prod1, new BigDecimal("15000.00"), new BigDecimal("1500.00"));
        crearCatalogoConItems(s2, empleado, prod2, new BigDecimal("80000.00"), new BigDecimal("8000.00"));
        crearCatalogoConItems(s3, empleado, prod3, new BigDecimal("25000.00"), new BigDecimal("2500.00"));

        em.flush();

        // Test client + user for Flow 4 happy-path testing
        Persona pCliente = new Persona();
        pCliente.setNombre("Usuario Test");
        pCliente.setDocumento("44444444");
        pCliente.setDireccion("Belgrano, CABA");
        pCliente.setEstado("activo");
        em.persist(pCliente);
        em.flush();

        Cliente clienteTest = new Cliente();
        clienteTest.setIdentificador(pCliente.getIdentificador());
        clienteTest.setPersona(pCliente);
        clienteTest.setPais(argentina);
        clienteTest.setAdmitido("si");
        clienteTest.setCategoria("plata");
        clienteTest.setVerificador(empleado);
        em.persist(clienteTest);
        em.flush();

        Usuario usuarioTest = new Usuario();
        usuarioTest.setEmail("test@subastapro.com");
        usuarioTest.setPasswordHash(passwordEncoder.encode("password123"));
        usuarioTest.setEstadoKyc("activo");
        usuarioTest.setClienteId(pCliente.getIdentificador());
        em.persist(usuarioTest);
        em.flush();

        MedioDePago medioTest = new MedioDePago();
        medioTest.setUsuarioId(usuarioTest.getId());
        medioTest.setTipo("tarjeta");
        medioTest.setMoneda("ARS");
        medioTest.setEstado("verificado");
        medioTest.setDatosEnmascarados("**** **** **** 4242");
        em.persist(medioTest);

        Asistente asistenteTest = new Asistente();
        asistenteTest.setCliente(clienteTest);
        asistenteTest.setSubasta(s1);
        asistenteTest.setNumeroPostor(1);
        em.persist(asistenteTest);

        em.flush();
    }

    private Producto crearProducto(String descripcion, String url, Empleado revisor, Duenio duenio, Seguro seguro) {
        Producto p = new Producto();
        p.setFecha(LocalDate.now());
        p.setDisponible("si");
        p.setDescripcionCatalogo(descripcion);
        p.setDescripcionCompleta(url);
        p.setRevisor(revisor);
        p.setDuenio(duenio);
        p.setSeguro(seguro);
        em.persist(p);
        return p;
    }

    private Subasta crearSubasta(LocalDate fecha, String categoria, String moneda, String ubicacion,
                                  Subastador subastador) {
        Subasta s = new Subasta();
        s.setFecha(fecha);
        s.setHora(LocalTime.of(18, 0));
        s.setEstado("abierta");
        s.setCategoria(categoria);
        s.setMoneda(moneda);
        s.setUbicacion(ubicacion);
        s.setCapacidadAsistentes(100);
        s.setTieneDeposito("si");
        s.setSeguridadPropia("si");
        s.setSubastador(subastador);
        em.persist(s);
        return s;
    }

    private void crearCatalogoConItems(Subasta subasta, Empleado responsable,
                                        Producto producto, BigDecimal precioBase, BigDecimal comision) {
        Catalogo catalogo = new Catalogo();
        catalogo.setDescripcion("Catálogo " + subasta.getCategoria());
        catalogo.setSubasta(subasta);
        catalogo.setResponsable(responsable);
        em.persist(catalogo);

        ItemCatalogo item = new ItemCatalogo();
        item.setCatalogo(catalogo);
        item.setProducto(producto);
        item.setPrecioBase(precioBase);
        item.setComision(comision);
        item.setSubastado("no");
        em.persist(item);
    }
}
