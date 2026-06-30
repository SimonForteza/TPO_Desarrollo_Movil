package com.example.backend.bienes.service;

import com.example.backend.bienes.dto.BienDetail;
import com.example.backend.bienes.dto.BienListItem;
import com.example.backend.bienes.dto.SeguroSummary;
import com.example.backend.bienes.dto.SubastaAsignadaResumen;
import com.example.backend.bienes.entity.BienEnConsignacion;
import com.example.backend.legacy.entity.Foto;
import com.example.backend.legacy.entity.Producto;
import com.example.backend.legacy.entity.Seguro;
import com.example.backend.legacy.entity.Subasta;
import com.example.backend.legacy.repository.FotoRepository;
import com.example.backend.legacy.repository.ProductoRepository;
import com.example.backend.shared.exception.ResourceNotFoundException;
import com.example.backend.subastas.repository.SubastaRepository;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Construye las respuestas (DTO) de {@code BienEnConsignacion} cargando el {@link Producto},
 * sus {@link Foto}s y, si está asignado, un resumen de la {@link Subasta}. Compartido por
 * {@code BienService} (usuario) y {@code AdminBienService} para mantener respuestas consistentes.
 *
 * Los métodos deben invocarse dentro de una transacción activa (los servicios son @Transactional)
 * porque acceden a relaciones LAZY como {@code Producto.seguro}.
 */
@Component
public class BienMapper {

    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final SubastaRepository subastaRepository;

    public BienMapper(ProductoRepository productoRepository,
                      FotoRepository fotoRepository,
                      SubastaRepository subastaRepository) {
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.subastaRepository = subastaRepository;
    }

    public BienListItem toListItem(BienEnConsignacion bien) {
        Producto producto = productoRepository.findById(bien.getProductoId()).orElse(null);
        String descripcion = producto != null ? producto.getDescripcionCatalogo() : null;
        return new BienListItem(
                bien.getId(),
                bien.getProductoId(),
                bien.getEstado(),
                descripcion,
                bien.getMotivoRechazo(),
                bien.getUbicacionDeposito(),
                bien.getPrecioBasePropuesto(),
                bien.getComisionPropuesta(),
                bien.getGastosDevolucion(),
                bien.getSubastaId(),
                primeraFotoBase64(bien.getProductoId()),
                bien.getCreadaEn());
    }

    /**
     * Igual que {@link #toListItem} pero sin la foto base64. Para respuestas administrativas
     * (Postman/Swagger) donde el blob solo entorpece la lectura y nadie lo consume.
     */
    public BienListItem toListItemSinFoto(BienEnConsignacion bien) {
        Producto producto = productoRepository.findById(bien.getProductoId()).orElse(null);
        String descripcion = producto != null ? producto.getDescripcionCatalogo() : null;
        return new BienListItem(
                bien.getId(),
                bien.getProductoId(),
                bien.getEstado(),
                descripcion,
                bien.getMotivoRechazo(),
                bien.getUbicacionDeposito(),
                bien.getPrecioBasePropuesto(),
                bien.getComisionPropuesta(),
                bien.getGastosDevolucion(),
                bien.getSubastaId(),
                null,
                bien.getCreadaEn());
    }

    public BienDetail toDetail(BienEnConsignacion bien) {
        Producto producto = productoRepository.findById(bien.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        List<String> fotos = fotoRepository.findByProductoIdentificador(producto.getIdentificador())
                .stream()
                .map(f -> b64(f.getFoto()))
                .collect(Collectors.toList());
        return new BienDetail(
                bien.getId(),
                bien.getProductoId(),
                bien.getEstado(),
                producto.getDescripcionCatalogo(),
                producto.getDescripcionCompleta(),
                fotos,
                bien.getMotivoRechazo(),
                bien.getUbicacionDeposito(),
                bien.getPrecioBasePropuesto(),
                bien.getComisionPropuesta(),
                bien.getGastosDevolucion(),
                toSeguroSummary(producto.getSeguro()),
                bien.getSubastaId(),
                toSubastaResumen(bien.getSubastaId()),
                bien.getCreadaEn());
    }

    public SeguroSummary toSeguroSummary(Seguro seguro) {
        if (seguro == null) return null;
        return new SeguroSummary(seguro.getNroPoliza(), seguro.getCompania(), seguro.getImporte());
    }

    private SubastaAsignadaResumen toSubastaResumen(Integer subastaId) {
        if (subastaId == null) return null;
        return subastaRepository.findById(subastaId)
                .map(s -> new SubastaAsignadaResumen(
                        s.getIdentificador(), s.getFecha(), s.getHora(), s.getEstado(),
                        s.getCategoria(), s.getMoneda(), s.getUbicacion()))
                .orElse(null);
    }

    private String primeraFotoBase64(Integer productoId) {
        List<Foto> fotos = fotoRepository.findByProductoIdentificador(productoId);
        return fotos.isEmpty() ? null : b64(fotos.get(0).getFoto());
    }

    private String b64(byte[] bytes) {
        return bytes == null ? null : Base64.getEncoder().encodeToString(bytes);
    }
}
