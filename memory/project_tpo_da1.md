---
name: project-tpo-da1
description: Estado del proyecto SubastaPro (TPO DAI UADE 1C2026) — qué está implementado, qué falta, decisiones tomadas
metadata:
  type: project
---

SubastaPro — TPO DAI UADE 1C2026. Equipo: Dillon Lucio, Forteza Simón, Addamo Juan Segundo.
Rama principal de trabajo: `luchito`. Merge de `feature/subastas_simon` realizado el 22/06/2026.

**Why:** TP universitario con entrega final que requiere app funcional para demo.
**How to apply:** Al sugerir qué implementar, priorizar por lo que bloquea la demo o es requisito de negocio del enunciado.

## Backend — implementado ✅

- Auth completo: registro 2 etapas, KYC simulado, JWT access+refresh, recuperar password
- Subastas: listado, detalle, catálogo, inscripción con TODAS las validaciones de negocio
  (categoría, multa pendiente, medio de pago verificado + moneda, una sola activa por usuario)
- Pujas: historial + pujar con validaciones (rango 1%-20% del precio base, multa, categoría, medio+moneda)
- Medios de pago: CRUD
- Bienes (consignación): CRUD usuario + admin aprobar/rechazar
- Cuentas de cobro: GET/POST /cuentas-cobro (agregado por Simón 22/06/2026)
- Compras: cierre de subasta (POST /admin/subastas/{id}/cerrar), GET /compras, GET /compras/{id}, GET /compras/{id}/factura (Simón)
- Multas (entity + repository solo): bloqueo ya integrado en InscripcionService y PujaService

## Backend — falta ❌

1. MultaService + MultaController: GET /multas, POST /multas/{id}/pagar (mockeado)
2. Scheduler multas → "judicial" a las 72hs (Spring @Scheduled)
3. Notificaciones (entity, service, controller) — disparar en eventos clave
4. Preferencias (entity, GET/PUT /me/preferencias)
5. /me/participaciones (historial de subastas del usuario)
6. /me/limite-disponible (saldo cheque certificado)

## Frontend — implementado ✅

- Auth flow completo + recuperación de password
- Home: listado subastas con filtros y búsqueda, conectado al backend
- DetalleSubasta: detalle + catálogo + botón inscribirse + sala de pujas
- PujasEnVivo: polling cada 4s, historial por ítem, pujar (rango validado en backend)
- MisProductos, DetalleProducto, SolicitarSubastaForm
- AddPaymentMethod + formularios (CuentaBancaria, TarjetaCredito, Cheque)
- ProfileScreen + Settings completos
- Cuentas de cobro: MisCuentasCobro + FormCuentaCobro (Simón)

## Frontend — falta ❌

1. MisCompras.js + DetalleCompra.js — backend listo, falta pantalla + api/compras.js
2. MisMultas.js — necesita backend primero
3. AddPaymentMethod: falta listado real (solo tiene formularios para agregar; falta GET /medios-pago con estados y borrar)
4. ProfileScreen stats hardcodeados en 0
5. Notificaciones: solo placeholder
6. Preferencias: no persiste al backend
7. PujasEnVivo: no muestra rango sugerido min/max en el UI (backend sí lo valida)

## Decisiones técnicas importantes

- Polling cada 4s en PujasEnVivo en lugar de WebSocket (decisión adoptada por tiempo)
- PDF factura: URL ficticia mockeada, sin integración real
- KYC: simulado, token de activación generado automáticamente
- Medios de pago: verificados automáticamente (mock del banco)
- Supabase PostgreSQL compartida por todo el equipo (dev = prod en esta fase)
- El esquema legacy (subastas, productos, etc.) no se puede modificar; solo se agregan tablas nuevas
