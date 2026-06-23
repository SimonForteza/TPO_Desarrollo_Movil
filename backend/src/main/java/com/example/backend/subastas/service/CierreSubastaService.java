package com.example.backend.subastas.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.auth.repository.UsuarioRepository;
import com.example.backend.bienes.repository.BienRepository;
import com.example.backend.bienes.util.EstadoBien;
import com.example.backend.compras.entity.Compra;
import com.example.backend.compras.repository.CompraRepository;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.entity.Duenio;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Producto;
import com.example.backend.legacy.entity.Pujo;
import com.example.backend.legacy.entity.RegistroDeSubasta;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.repository.RegistroDeSubastaRepository;
import com.example.backend.mediosdepago.entity.MedioDePago;
import com.example.backend.mediosdepago.repository.MedioDePagoRepository;
import com.example.backend.pujas.repository.PujoRepository;
import com.example.backend.shared.exception.BusinessRuleException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.dto.CierreSubastaResponse;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import com.example.backend.subastas.repository.SubastaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final MedioDePagoRepository medioDePagoRepository;

    public CierreSubastaService(SubastaRepository subastaRepository,
                                ItemCatalogoRepository itemCatalogoRepository,
                                PujoRepository pujoRepository,
                                CompraRepository compraRepository,
                                UsuarioRepository usuarioRepository,
                                BienRepository bienRepository,
                                RegistroDeSubastaRepository registroDeSubastaRepository,
                                MedioDePagoRepository medioDePagoRepository) {
        this.subastaRepository = subastaRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujoRepository = pujoRepository;
        this.compraRepository = compraRepository;
        this.usuarioRepository = usuarioRepository;
        this.bienRepository = bienRepository;
        this.registroDeSubastaRepository = registroDeSubastaRepository;
        this.medioDePagoRepository = medioDePagoRepository;
    }

    public CierreSubastaResponse cerrar(Integer subastaId) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));

        if (!"abierta".equals(subasta.getEstado())) {
            throw new BusinessRuleException("Auction is not open");
        }

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId);
        int comprasGeneradas = 0;
        int itemsCompradosPorEmpresa = 0;
        int itemsSinFondos = 0;

        for (ItemCatalogo item : items) {
            if ("si".equals(item.getSubastado())) {
                continue;
            }

            Producto producto = item.getProducto();
            Duenio duenio = producto != null ? producto.getDuenio() : null;
            List<Pujo> pujos = pujoRepository.findByItemIdentificador(item.getIdentificador());

            if (pujos.isEmpty()) {
                // Nadie pujó: la empresa compra al precio base. Solo se registra la venta (sin Compra de usuario).
                registroDeSubastaRepository.save(
                        buildRegistro(subasta, duenio, producto, null, item.getPrecioBase(), item.getComision()));
                itemsCompradosPorEmpresa++;
                finalizarVenta(item, producto);
                continue;
            }

            Pujo ganadora = pujos.stream()
                    .max(Comparator.comparing(Pujo::getImporte))
                    .orElseThrow();

            // El comprador paga monto final + comisión. Se verifica contra el medio usado al inscribirse.
            BigDecimal total = ganadora.getImporte().add(item.getComision());
            Long medioId = ganadora.getAsistente().getMedioPagoId();
            MedioDePago medio = medioId == null ? null
                    : medioDePagoRepository.findById(medioId).orElse(null);

            if (medio == null || medio.getSaldo() == null || medio.getSaldo().compareTo(total) < 0) {
                // Fondos insuficientes: no se concreta la compra ni la venta.
                // (Chunk C: acá se generará la Multa del 10% y se resolverá el ítem.)
                itemsSinFondos++;
                continue;
            }

            ganadora.setGanador("si");
            pujoRepository.save(ganadora);

            Cliente clienteGanador = ganadora.getAsistente().getCliente();
            registroDeSubastaRepository.save(
                    buildRegistro(subasta, duenio, producto, clienteGanador,
                            ganadora.getImporte(), item.getComision()));

            // Mapea el cliente legacy ganador a su Usuario para crear la Compra y descontar los fondos.
            Usuario usuarioGanador = usuarioRepository
                    .findByClienteId(clienteGanador.getIdentificador())
                    .orElse(null);
            if (usuarioGanador != null) {
                Compra compra = new Compra();
                compra.setUsuarioId(usuarioGanador.getId());
                compra.setItemId(item.getIdentificador());
                compra.setMedioPagoId(medio.getId());
                compra.setMontoFinal(ganadora.getImporte());
                compra.setComision(item.getComision());
                compra.setCostoEnvio(BigDecimal.ZERO);
                compra.setEstado("pendiente");
                compraRepository.save(compra);
                comprasGeneradas++;

                medio.setSaldo(medio.getSaldo().subtract(total));
                medioDePagoRepository.save(medio);
            }

            finalizarVenta(item, producto);
        }

        subasta.setEstado("cerrada");
        subastaRepository.save(subasta);

        return new CierreSubastaResponse(subastaId, subasta.getEstado(),
                items.size(), comprasGeneradas, itemsCompradosPorEmpresa, itemsSinFondos);
    }

    private void finalizarVenta(ItemCatalogo item, Producto producto) {
        item.setSubastado("si");
        itemCatalogoRepository.save(item);

        if (producto != null) {
            bienRepository.findByProductoId(producto.getIdentificador()).ifPresent(bien -> {
                bien.setEstado(EstadoBien.VENDIDO);
                bienRepository.save(bien);
            });
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
