package com.example.backend.categorias.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.categorias.dto.CategoriaProgresoResponse;
import com.example.backend.compras.repository.CompraRepository;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.repository.ClienteRepository;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.notificaciones.service.NotificacionService;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.AsistenteRepository;
import com.example.backend.subastas.util.Categoria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Chunk E — Mejora de categoría del usuario.
 *
 * Recalcula {@code clientes.categoria} en función de la diversidad de medios de pago verificados
 * y de la actividad en subastas. Se asigna el tier más alto cuyos requisitos se cumplan TODOS
 * (tabla AND). El recálculo es <b>monótono</b>: solo sube de categoría, nunca baja, de modo que
 * no rompe inscripciones ya válidas y respeta el enunciado ("permiten mejorar su categoría").
 *
 * Disparadores: al verificar un medio de pago ({@code MedioDePagoService.create}) y al cerrar una
 * subasta ({@code CierreSubastaService}).
 */
@Service
@Transactional
public class CategoriaUsuarioService {

    /** Requisitos por tier: cumplir TODOS para alcanzarlo. */
    private record Requisito(int tipos, int participadas, int ganadas) {}

    private static final Map<Categoria, Requisito> REQUISITOS = Map.of(
            Categoria.ESPECIAL, new Requisito(1, 1, 0),
            Categoria.PLATA, new Requisito(2, 3, 0),
            Categoria.ORO, new Requisito(3, 5, 1),
            Categoria.PLATINO, new Requisito(3, 10, 3)
    );

    /** Tiers de mayor a menor, para elegir el más alto que el usuario cumpla. */
    private static final Categoria[] DESCENDENTE = {
            Categoria.PLATINO, Categoria.ORO, Categoria.PLATA, Categoria.ESPECIAL
    };

    private record Metricas(int tipos, int participadas, int ganadas) {}

    private final ClienteRepository clienteRepository;
    private final MedioDePagoRepository medioDePagoRepository;
    private final AsistenteRepository asistenteRepository;
    private final CompraRepository compraRepository;
    private final NotificacionService notificacionService;

    public CategoriaUsuarioService(ClienteRepository clienteRepository,
                                   MedioDePagoRepository medioDePagoRepository,
                                   AsistenteRepository asistenteRepository,
                                   CompraRepository compraRepository,
                                   NotificacionService notificacionService) {
        this.clienteRepository = clienteRepository;
        this.medioDePagoRepository = medioDePagoRepository;
        this.asistenteRepository = asistenteRepository;
        this.compraRepository = compraRepository;
        this.notificacionService = notificacionService;
    }

    /**
     * Recalcula la categoría del usuario y la sube si corresponde. Idempotente y silencioso
     * cuando el usuario no tiene perfil de cliente, para no romper el flujo que lo invoca.
     */
    public void recalcular(Usuario usuario) {
        if (usuario == null || usuario.getClienteId() == null) return;
        Cliente cliente = clienteRepository.findById(usuario.getClienteId()).orElse(null);
        if (cliente == null) return;

        Categoria actual = parseActual(cliente.getCategoria());
        Categoria merecida = tierMerecido(metricas(usuario, cliente));

        if (merecida.getRank() > actual.getRank()) {
            cliente.setCategoria(merecida.getDbValue());
            clienteRepository.save(cliente);
            notificacionService.crear(usuario.getId(), "CATEGORIA_MEJORADA",
                    "¡Subiste de categoría!",
                    "Ahora sos categoría " + merecida.getDbValue() + ". ¡Felicitaciones!",
                    "USUARIO", usuario.getId());
        }
    }

    /** Categoría actual + requisitos del tier siguiente, para mostrar el progreso en el perfil. */
    @Transactional(readOnly = true)
    public CategoriaProgresoResponse progreso(Usuario usuario) {
        Cliente cliente = clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));

        Metricas m = metricas(usuario, cliente);
        Categoria actual = parseActual(cliente.getCategoria());
        Categoria siguiente = siguienteDe(actual);
        Requisito req = siguiente != null ? REQUISITOS.get(siguiente) : null;

        return new CategoriaProgresoResponse(
                actual.getDbValue(),
                siguiente != null ? siguiente.getDbValue() : null,
                m.tipos(), m.participadas(), m.ganadas(),
                req != null ? req.tipos() : null,
                req != null ? req.participadas() : null,
                req != null ? req.ganadas() : null);
    }

    private Metricas metricas(Usuario usuario, Cliente cliente) {
        int tipos = medioDePagoRepository.findDistinctTiposVerificados(usuario.getId()).size();
        int participadas = (int) asistenteRepository.countByClienteIdentificador(cliente.getIdentificador());
        int ganadas = (int) compraRepository.countByUsuarioId(usuario.getId());
        return new Metricas(tipos, participadas, ganadas);
    }

    /** Tier más alto cuyos requisitos cumple el usuario; comun si no cumple ninguno. */
    private Categoria tierMerecido(Metricas m) {
        for (Categoria c : DESCENDENTE) {
            Requisito r = REQUISITOS.get(c);
            if (m.tipos() >= r.tipos() && m.participadas() >= r.participadas() && m.ganadas() >= r.ganadas()) {
                return c;
            }
        }
        return Categoria.COMUN;
    }

    private Categoria siguienteDe(Categoria actual) {
        return switch (actual) {
            case COMUN -> Categoria.ESPECIAL;
            case ESPECIAL -> Categoria.PLATA;
            case PLATA -> Categoria.ORO;
            case ORO -> Categoria.PLATINO;
            case PLATINO -> null;
        };
    }

    /** Categoría legacy a enum; null/blank/desconocida se tratan como comun. */
    private Categoria parseActual(String value) {
        if (value == null || value.isBlank()) return Categoria.COMUN;
        try {
            return Categoria.from(value);
        } catch (RuntimeException e) {
            return Categoria.COMUN;
        }
    }
}
