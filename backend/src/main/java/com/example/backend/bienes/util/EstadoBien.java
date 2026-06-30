package com.example.backend.bienes.util;

/**
 * Estados válidos de un {@code BienEnConsignacion}. {@code estado} se persiste como String,
 * por lo que estas constantes centralizan los valores para evitar typos.
 *
 * Flujo: pendiente_revision -> aprobado -> esperando_subasta -> asignado -> vendido
 *                          \-> rechazado (con motivoRechazo)
 *                          (opcional) -> devuelto
 *
 * - aprobado: la empresa propuso condiciones; el usuario todavia no decidio.
 * - esperando_subasta: el usuario acepto las condiciones; queda a la espera de que el admin
 *   lo incluya en una subasta. Este es el pool del que se arman las subastas.
 * - asignado: ya esta dentro de una subasta (subastaId seteado).
 */
public final class EstadoBien {

    public static final String PENDIENTE_REVISION = "pendiente_revision";
    public static final String APROBADO = "aprobado";
    public static final String ESPERANDO_SUBASTA = "esperando_subasta";
    public static final String RECHAZADO = "rechazado";
    public static final String ASIGNADO = "asignado";
    public static final String VENDIDO = "vendido";
    public static final String DEVUELTO = "devuelto";

    private EstadoBien() {
    }
}
