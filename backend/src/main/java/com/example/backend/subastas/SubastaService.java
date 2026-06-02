package com.example.backend.subastas;

import com.example.backend.auth.entity.Usuario;
import com.example.backend.legacy.entity.Cliente;
import com.example.backend.legacy.entity.Foto;
import com.example.backend.legacy.entity.ItemCatalogo;
import com.example.backend.legacy.entity.Producto;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.entity.Subastador;
import com.example.backend.legacy.repository.ClienteRepository;
import com.example.backend.legacy.repository.FotoRepository;
import com.example.backend.shared.dto.PagedResponse;
import com.example.backend.shared.exception.ForbiddenException;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final FotoRepository fotoRepository;
    private final ClienteRepository clienteRepository;

    public SubastaService(SubastaRepository subastaRepository,
                          ItemCatalogoRepository itemCatalogoRepository,
                          FotoRepository fotoRepository,
                          ClienteRepository clienteRepository) {
        this.subastaRepository = subastaRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.fotoRepository = fotoRepository;
        this.clienteRepository = clienteRepository;
    }

    public PagedResponse<SubastaListItem> list(Usuario usuario, String estado, String moneda,
                                               String categoria, Pageable pageable) {
        Cliente cliente = loadCliente(usuario);
        List<String> allowed = Categoria.allowedFor(cliente.getCategoria());

        // If caller filters by a category they can't access, return empty silently
        if (categoria != null && !allowed.contains(categoria)) {
            return new PagedResponse<>(List.of(), pageable.getPageNumber(), pageable.getPageSize(), 0, 0);
        }

        Page<Subasta> page = subastaRepository.search(allowed, estado, moneda, categoria, pageable);
        List<SubastaListItem> content = page.getContent().stream()
                .map(s -> new SubastaListItem(s.getIdentificador(), s.getFecha(), s.getHora(),
                        s.getEstado(), s.getCategoria(), s.getMoneda(), s.getUbicacion()))
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public SubastaDetailResponse detail(Usuario usuario, Integer id) {
        Cliente cliente = loadCliente(usuario);
        Subasta subasta = subastaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + id));
        assertAccess(cliente, subasta.getCategoria());

        SubastadorSummary subastadorSummary = null;
        Subastador sub = subasta.getSubastador();
        if (sub != null) {
            String nombre = sub.getPersona() != null ? sub.getPersona().getNombre() : null;
            subastadorSummary = new SubastadorSummary(sub.getIdentificador(), nombre,
                    sub.getMatricula(), sub.getRegion());
        }

        return new SubastaDetailResponse(
                subasta.getIdentificador(), subasta.getFecha(), subasta.getHora(),
                subasta.getEstado(), subasta.getCategoria(), subasta.getMoneda(),
                subasta.getUbicacion(), subasta.getCapacidadAsistentes(),
                subasta.getTieneDeposito(), subasta.getSeguridadPropia(), subastadorSummary);
    }

    public PagedResponse<CatalogoItemListResponse> catalogo(Usuario usuario, Integer subastaId, Pageable pageable) {
        Cliente cliente = loadCliente(usuario);
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));
        assertAccess(cliente, subasta.getCategoria());

        boolean admitido = "si".equals(cliente.getAdmitido());
        Page<ItemCatalogo> page = itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId, pageable);

        List<CatalogoItemListResponse> content = page.getContent().stream()
                .map(item -> {
                    Producto producto = item.getProducto();
                    List<Foto> fotos = fotoRepository.findByProductoIdentificador(producto.getIdentificador());
                    String primeraFoto = fotos.isEmpty() ? null : b64(fotos.get(0).getFoto());
                    ProductoSummary productoSummary = new ProductoSummary(
                            producto.getIdentificador(), producto.getDescripcionCatalogo(), primeraFoto);
                    return new CatalogoItemListResponse(
                            item.getIdentificador(), item.getSubastado(),
                            admitido ? item.getPrecioBase() : null,
                            productoSummary);
                })
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    public CatalogoItemDetailResponse itemDetail(Usuario usuario, Integer subastaId, Integer itemId) {
        Cliente cliente = loadCliente(usuario);
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found: " + subastaId));
        assertAccess(cliente, subasta.getCategoria());

        ItemCatalogo item = itemCatalogoRepository
                .findByIdentificadorAndCatalogoSubastaIdentificador(itemId, subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        Producto producto = item.getProducto();
        List<Foto> fotos = fotoRepository.findByProductoIdentificador(producto.getIdentificador());
        List<String> fotosBase64 = fotos.stream()
                .map(f -> b64(f.getFoto()))
                .collect(Collectors.toList());

        boolean admitido = "si".equals(cliente.getAdmitido());
        ProductoDetail productoDetail = new ProductoDetail(
                producto.getIdentificador(), producto.getDescripcionCatalogo(),
                producto.getDescripcionCompleta(), fotosBase64);

        return new CatalogoItemDetailResponse(
                item.getIdentificador(), item.getSubastado(),
                admitido ? item.getPrecioBase() : null,
                admitido ? item.getComision() : null,
                productoDetail);
    }

    private Cliente loadCliente(Usuario usuario) {
        return clienteRepository.findById(usuario.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not found"));
    }

    private void assertAccess(Cliente cliente, String subastaCategoria) {
        if (!Categoria.from(cliente.getCategoria()).canAccess(subastaCategoria)) {
            throw new ForbiddenException("Your category does not allow access to this auction");
        }
    }

    private String b64(byte[] bytes) {
        if (bytes == null) return null;
        return Base64.getEncoder().encodeToString(bytes);
    }
}
