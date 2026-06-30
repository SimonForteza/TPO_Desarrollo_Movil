package com.example.backend.subastas.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.auth.repository.UsuarioRepository;
import com.example.backend.bienes.repository.BienRepository;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.categorias.service.CategoriaUsuarioService;
import com.example.backend.compras.entity.Compra;
import com.example.backend.compras.repository.CompraRepository;
import com.example.backend.compras.service.CompraService;
import com.example.backend.legacy.entity.Asistente;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.entity.Duenio;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Producto;
import com.example.backend.legacy.entity.Pujo;
import com.example.backend.legacy.entity.RegistroDeSubasta;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.repository.RegistroDeSubastaRepository;
import com.example.backend.notificaciones.service.NotificacionService;
import com.example.backend.pujas.repository.PujoRepository;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.dto.CierreLoteResultado;
import com.example.backend.subastas.dto.CierreSubastaResponse;
import com.example.backend.subastas.repository.AsistenteRepository;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import com.example.backend.subastas.repository.SubastaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class CierreSubastaService {

    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujoRepository pujoRepository;
    private final CompraRepository compraRepository;
    private final UsuarioRepository usuarioRepository;
    private final BienRepository bienRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final NotificacionService notificacionService;
    private final AsistenteRepository asistenteRepository;
    private final CategoriaUsuarioService categoriaUsuarioService;

    public CierreSubastaService(SubastaRepository subastaRepository,
                                ItemCatalogoRepository itemCatalogoRepository,
                                PujoRepository pujoRepository,
                                CompraRepository compraRepository,
                                UsuarioRepository usuarioRepository,
                                BienRepository bienRepository,
                                RegistroDeSubastaRepository registroDeSubastaRepository,
                                NotificacionService notificacionService,
                                AsistenteRepository asistenteRepository,
                                CategoriaUsuarioService categoriaUsuarioService) {
        this.subastaRepository = subastaRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujoRepository = pujoRepository;
        this.compraRepository = compraRepository;
        this.usuarioRepository = usuarioRepository;
        this.bienRepository = bienRepository;
        this.registroDeSubastaRepository = registroDeSubastaRepository;
        this.notificacionService = notificacionService;
        this.asistenteRepository = asistenteRepository;
        this.categoriaUsuarioService = categoriaUsuarioService;
    }

    /**
     * Cierre administrativo de toda la subasta de una sola vez (Swagger/Postman). Recorre
     * todos los lotes pendientes y los martilla. Equivale a dejar correr el remate hasta el final.
     */
    public CierreSubastaResponse cerrar(Integer subastaId) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));

        if (!"abierta".equals(subasta.getEstado())) {
            throw new BusinessRuleException("Auction is not open");
        }

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId);
        int comprasGeneradas = 0;
        int itemsCompradosPorEmpresa = 0;

        for (ItemCatalogo item : items) {
            CierreLoteResultado res = cerrarItem(subasta, item);
            if (res.compraGenerada()) comprasGeneradas++;
            if (res.sinOfertas()) itemsCompradosPorEmpresa++;
        }

        marcarCerradaSiCorresponde(subasta);

        return new CierreSubastaResponse(subastaId, subasta.getEstado(),
                items.size(), comprasGeneradas, itemsCompradosPorEmpresa);
    }

    /**
     * Martilla un único lote: elige el mejor postor (o lo adjudica a la casa si nadie pujó),
     * lo marca como subastado, registra la venta y genera la Compra del ganador.
     *
     * Idempotente: si el lote ya está cerrado ({@code subastado = 'si'}), reconstruye y
     * devuelve el resultado existente sin efectos secundarios. Esto permite que varios
     * clientes que llegan al deadline a la vez obtengan el mismo "Vendido a $X".
     */
    public CierreLoteResultado cerrarItem(Subasta subasta, ItemCatalogo item) {
        List<Pujo> pujos = pujoRepository.findByItemIdentificador(item.getIdentificador());

        // Ya cerrado en este mismo flujo (en memoria) → idempotente.
        if ("si".equals(item.getSubastado())) {
            return reconstruirResultado(item, pujos);
        }

        // Claim atómico del cierre: solo UNA transacción gana (afecta 1 fila). Si otro cliente
        // martilló el mismo lote a la vez, acá obtenemos 0 y salimos sin duplicar Compra/registro.
        int claimed = itemCatalogoRepository.marcarSubastado(item.getIdentificador());
        item.setSubastado("si"); // refleja el cierre en memoria para que el remate avance al siguiente lote
        if (claimed == 0) {
            // Perdimos la carrera; la transacción ganadora ya commiteó: releemos para reconstruir.
            return reconstruirResultado(item, pujoRepository.findByItemIdentificador(item.getIdentificador()));
        }

        Producto producto = item.getProducto();
        Duenio duenio = producto != null ? producto.getDuenio() : null;
        CierreLoteResultado resultado;

        if (pujos.isEmpty()) {
            // Nadie pujó: la empresa compra al precio base. Solo se registra la venta (sin Compra de usuario).
            registroDeSubastaRepository.save(
                    buildRegistro(subasta, duenio, producto, null, item.getPrecioBase(), item.getComision()));
            resultado = new CierreLoteResultado(item.getIdentificador(), false, true,
                    item.getPrecioBase(), null, false);
        } else {
            Pujo ganadora = pujos.stream()
                    .max(Comparator.comparing(Pujo::getImporte))
                    .orElseThrow();
            ganadora.setGanador("si");
            pujoRepository.save(ganadora);

            Cliente clienteGanador = ganadora.getAsistente().getCliente();
            registroDeSubastaRepository.save(
                    buildRegistro(subasta, duenio, producto, clienteGanador,
                            ganadora.getImporte(), item.getComision()));

            // Mapea el cliente legacy ganador a su Usuario para crear la Compra.
            Usuario usuarioGanador = usuarioRepository
                    .findByClienteId(clienteGanador.getIdentificador())
                    .orElse(null);
            boolean compraGenerada = false;
            if (usuarioGanador != null) {
                Compra compra = new Compra();
                compra.setUsuarioId(usuarioGanador.getId());
                compra.setItemId(item.getIdentificador());
                compra.setMontoFinal(ganadora.getImporte());
                compra.setComision(item.getComision());
                // Estimado de envío (envío a domicilio por defecto). Se recalcula al pagar:
                // si el ganador elige retiro en persona, CompraService lo pone en 0.
                compra.setCostoEnvio(CompraService.COSTO_ENVIO_MOCK);
                compra.setEstado("pendiente");
                // El ganador tiene 72 hs para pagar el lote; vencido sin pago → multa.
                compra.setPagarAntesDe(LocalDateTime.now().plusHours(72));
                compraRepository.save(compra);
                compraGenerada = true;

                String desc = item.getProducto() != null ? item.getProducto().getDescripcionCatalogo() : "Lote #" + item.getIdentificador();
                BigDecimal comision = item.getComision() != null ? item.getComision() : BigDecimal.ZERO;
                BigDecimal total = ganadora.getImporte().add(comision);
                notificacionService.crear(usuarioGanador.getId(), "LOTE_GANADO",
                        "¡Ganaste un lote!",
                        String.format("Ganaste \"%s\". Total a pagar: $%s (oferta $%s + comisión $%s). Tenés 72 hs.",
                                desc, total.toPlainString(), ganadora.getImporte().toPlainString(), comision.toPlainString()),
                        "COMPRA", compra.getId());

                // Una nueva victoria puede mejorar la categoría del ganador.
                categoriaUsuarioService.recalcular(usuarioGanador);
            }
            resultado = new CierreLoteResultado(item.getIdentificador(), true, false,
                    ganadora.getImporte(), ganadora.getAsistente().getNumeroPostor(), compraGenerada);
        }

        if (producto != null) {
            bienRepository.findByProductoId(producto.getIdentificador()).ifPresent(bien -> {
                bien.setEstado(EstadoBien.VENDIDO);
                bienRepository.save(bien);
            });
        }

        return resultado;
    }

    /** Reconstruye el resultado de un lote ya cerrado a partir de la puja ganadora persistida. */
    private CierreLoteResultado reconstruirResultado(ItemCatalogo item, List<Pujo> pujos) {
        Pujo ganadora = pujos.stream()
                .filter(p -> "si".equals(p.getGanador()))
                .findFirst()
                .orElse(null);
        if (ganadora != null) {
            return new CierreLoteResultado(item.getIdentificador(), true, false,
                    ganadora.getImporte(), ganadora.getAsistente().getNumeroPostor(), false);
        }
        return new CierreLoteResultado(item.getIdentificador(), false, true,
                item.getPrecioBase(), null, false);
    }

    /** Si todos los lotes ya están subastados, marca la subasta como cerrada. */
    public void marcarCerradaSiCorresponde(Subasta subasta) {
        if (!"abierta".equals(subasta.getEstado())) return;
        boolean quedanPendientes = itemCatalogoRepository
                .findByCatalogoSubastaIdentificador(subasta.getIdentificador()).stream()
                .anyMatch(i -> !"si".equals(i.getSubastado()));
        if (!quedanPendientes) {
            subasta.setEstado("cerrada");
            subastaRepository.save(subasta);
            recalcularCategoriaParticipantes(subasta);
        }
    }

    /**
     * Al cerrar la subasta, recalcula la categoría de todos sus participantes: la actividad
     * acumulada (participaciones) puede promover a quienes no ganaron ningún lote.
     */
    private void recalcularCategoriaParticipantes(Subasta subasta) {
        for (Asistente asistente : asistenteRepository.findBySubastaIdentificador(subasta.getIdentificador())) {
            Cliente cliente = asistente.getCliente();
            if (cliente == null) continue;
            usuarioRepository.findByClienteId(cliente.getIdentificador())
                    .ifPresent(categoriaUsuarioService::recalcular);
        }
    }

    private RegistroDeSubasta buildRegistro(Subasta subasta, Duenio duenio, Producto producto,
                                            Cliente cliente, BigDecimal importe, BigDecimal comision) {
        RegistroDeSubasta registro = new RegistroDeSubasta();
        registro.setSubasta(subasta);
        registro.setDuenio(duenio);
        registro.setProducto(producto);
        registro.setCliente(cliente);
        registro.setImporte(importe);
        registro.setComision(comision);
        return registro;
    }
}
