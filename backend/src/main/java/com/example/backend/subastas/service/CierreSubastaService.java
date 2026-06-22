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

    public CierreSubastaService(SubastaRepository subastaRepository,
                                ItemCatalogoRepository itemCatalogoRepository,
                                PujoRepository pujoRepository,
                                CompraRepository compraRepository,
                                UsuarioRepository usuarioRepository,
                                BienRepository bienRepository,
                                RegistroDeSubastaRepository registroDeSubastaRepository) {
        this.subastaRepository = subastaRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujoRepository = pujoRepository;
        this.compraRepository = compraRepository;
        this.usuarioRepository = usuarioRepository;
        this.bienRepository = bienRepository;
        this.registroDeSubastaRepository = registroDeSubastaRepository;
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
                if (usuarioGanador != null) {
                    Compra compra = new Compra();
                    compra.setUsuarioId(usuarioGanador.getId());
                    compra.setItemId(item.getIdentificador());
                    compra.setMontoFinal(ganadora.getImporte());
                    compra.setComision(item.getComision());
                    compra.setCostoEnvio(BigDecimal.ZERO);
                    compra.setEstado("pendiente");
                    compraRepository.save(compra);
                    comprasGeneradas++;
                }
            }

            item.setSubastado("si");
            itemCatalogoRepository.save(item);

            if (producto != null) {
                bienRepository.findByProductoId(producto.getIdentificador()).ifPresent(bien -> {
                    bien.setEstado(EstadoBien.VENDIDO);
                    bienRepository.save(bien);
                });
            }
        }

        subasta.setEstado("cerrada");
        subastaRepository.save(subasta);

        return new CierreSubastaResponse(subastaId, subasta.getEstado(),
                items.size(), comprasGeneradas, itemsCompradosPorEmpresa);
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
