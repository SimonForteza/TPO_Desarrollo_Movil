package com.example.backend.compras.service;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.compras.dto.CompraDetail;
import com.example.backend.compras.dto.CompraListItem;
import com.example.backend.compras.dto.FacturaResponse;
import com.example.backend.compras.entity.Compra;
import com.example.backend.compras.repository.CompraRepository;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.ItemCatalogoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CompraService {

    private final CompraRepository compraRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;

    public CompraService(CompraRepository compraRepository,
                         ItemCatalogoRepository itemCatalogoRepository) {
        this.compraRepository = compraRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
    }

    public PagedResponse<CompraListItem> list(Usuario usuario, Pageable pageable) {
        Page<Compra> page = compraRepository.findByUsuarioId(usuario.getId(), pageable);
        List<CompraListItem> content = page.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public CompraDetail detail(Usuario usuario, Long id) {
        Compra compra = findOwned(usuario, id);
        return new CompraDetail(
                compra.getId(),
                compra.getItemId(),
                descripcionProducto(compra.getItemId()),
                compra.getMontoFinal(),
                compra.getComision(),
                compra.getCostoEnvio(),
                compra.isConSeguroEnvio(),
                compra.isRetiraPersonalmente(),
                total(compra),
                compra.getEstado(),
                compra.getCreadaEn());
    }

    public FacturaResponse factura(Usuario usuario, Long id, String formato) {
        Compra compra = findOwned(usuario, id);
        // PDF mockeado: se devuelve una URL ficticia (sin integración real de generación).
        return new FacturaResponse(
                compra.getId(),
                "FAC-" + compra.getId(),
                compra.getCreadaEn(),
                descripcionProducto(compra.getItemId()),
                compra.getMontoFinal(),
                compra.getComision(),
                compra.getCostoEnvio(),
                total(compra),
                "https://cdn.subastas.com/facturas/" + compra.getId() + ".pdf");
    }

    private Compra findOwned(Usuario usuario, Long id) {
        return compraRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: " + id));
    }

    private CompraListItem toListItem(Compra compra) {
        return new CompraListItem(
                compra.getId(),
                compra.getItemId(),
                descripcionProducto(compra.getItemId()),
                compra.getMontoFinal(),
                compra.getComision(),
                compra.getCostoEnvio(),
                total(compra),
                compra.getEstado(),
                compra.getCreadaEn());
    }

    private BigDecimal total(Compra compra) {
        return compra.getMontoFinal().add(compra.getComision()).add(compra.getCostoEnvio());
    }

    private String descripcionProducto(Integer itemId) {
        return itemCatalogoRepository.findById(itemId)
                .map(ItemCatalogo::getProducto)
                .map(p -> p.getDescripcionCatalogo())
                .orElse(null);
    }
}
