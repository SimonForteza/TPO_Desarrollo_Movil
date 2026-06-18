package com.example.backend.bienes.util;

/**
 * Estados válidos de un {@code BienEnConsignacion}. {@code estado} se persiste como String,
 * por lo que estas constantes centralizan los valores para evitar typos.
 *
 * Flujo: pendiente_revision -> aprobado -> asignado -> vendido
 *                          \-> rechazado (con motivoRechazo)
 *                          (opcional) -> devuelto
 */
public final class EstadoBien {

    public static final String PENDIENTE_REVISION = "pendiente_revision";
    public static final String APROBADO = "aprobado";
    public static final String RECHAZADO = "rechazado";
    public static final String ASIGNADO = "asignado";
    public static final String VENDIDO = "vendido";
    public static final String DEVUELTO = "devuelto";

    private EstadoBien() {
    }
}
