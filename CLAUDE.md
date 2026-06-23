# CLAUDE.md — SubastaPro (Backend + Frontend)

> Contexto completo del proyecto. **Leer este archivo entero** antes de tocar código.
> Aplica tanto al backend (Spring Boot) como al frontend (React Native / Expo).

---

## 1. Qué es este proyecto

**SubastaPro** es una aplicación móvil para una empresa que organiza subastas presenciales
de arte / bienes de alta gama. La app permite a los usuarios participar online (puje en vivo),
solicitar la consignación de bienes propios, gestionar sus medios de pago y ver su historial.

- **Equipo:** Forteza Simón, Addamo Juan Segundo, Dillon Lucio — TPO DAI UADE 1C2026
- **Docentes:** Goddio Claudio, Narducci Adrian — Comisión Martes Tarde
- **Repo:** https://github.com/SimonForteza/TPO_Desarrollo_Movil
- **Figma (wireframes):** https://www.figma.com/design/kbc5MXvzF8xcswsv21En1a/TPO-DAI-%E2%80%94-Wireframes-Registro--Copy-
  (acceder vía MCP de Figma cuando se necesite mirar un wireframe)
- **Documento de cátedra:** `TPO_DAI_1C2026.docx` (raíz del repo de la materia)
- **Esquema legacy:** `EstructuraActual.sql` (raíz). **NO se pueden modificar columnas**;
  sí se pueden agregar tablas nuevas.

### Aclaraciones del proyecto universitario (hardcodeado a propósito)

- **Verificación KYC del DNI:** simulada (`KycSimulacionService`). El "empleado verificador"
  no existe — al registrarse, se genera automáticamente el token de activación.
- **Medios de pago:** la validación con el banco / la tarjetera / el cheque es **mockeada**.
  No se llama a ninguna pasarela real. Se marca `verificado` directamente.
- **Pago de compras y multas:** mockeado. No hay integración con MercadoPago / Stripe / etc.
- **Streaming de la subasta:** fuera del alcance del TP (lo aclara el enunciado).
- **Generación de PDFs (factura, descripción del producto):** se devuelve una URL ficticia
  o se simula el contenido.

---

## 2. Stack

### Backend
| Capa | Tecnología |
|------|-----------|
| Lenguaje | Java 17 |
| Framework | Spring Boot 3.4.5 |
| ORM | Spring Data JPA + Hibernate |
| Base de datos | **Supabase PostgreSQL** (dev/prod compartida) / H2 (tests) |
| Auth | JWT (access + refresh) — `JwtAuthenticationFilter` ya activo |
| Build | Maven |
| Extras | Lombok, Spring DevTools |
| Docs | OpenAPI 3 / Swagger UI (`/swagger-ui.html`) |

### Frontend
| Capa | Tecnología |
|------|-----------|
| Framework | React Native + Expo SDK 56 |
| Estado | `useState` / `useEffect` (sin Redux) |
| HTTP | `axios` (con interceptor que inyecta el JWT) |
| Navegación | `@react-navigation/native-stack` |
| Storage | `@react-native-async-storage/async-storage` |
| Imágenes | `expo-image-picker` / `expo-camera` |

> Antes de tocar Expo, revisar **siempre** los docs de la versión exacta:
> https://docs.expo.dev/versions/v56.0.0/

---

## 3. Estructura del repo

```
TPO_Desarrollo_Movil/
├── backend/                        ← Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/example/backend/
│       ├── auth/        (controller, service, dto, entity, repository, security, kyc)
│       ├── subastas/    (controller, service, dto, repository, util)
│       ├── pujas/       (controller, service, dto, repository)
│       ├── mediosdepago/(controller, service, dto, entity, repository)
│       ├── bienes/      (controller user + admin, service, dto, entity, repository, util)
│       ├── compras/     (controller, service, dto, entity, repository)
│       ├── cuentascobro/(controller, service, dto, entity, repository)
│       ├── multas/      (controller, service, dto, entity, repository)
│       ├── me/          (controller, service, dto)   ← /me/participaciones
│       ├── saldo/       (SaldoService [interface], SaldoServiceImpl, SaldoConfig [stub])
│       ├── subastas/    (… + entity: LoteRemate; AdminSubastaController, RemateController)
│       ├── legacy/      (entity, repository)   ← mapeo del SQL de la cátedra
│       ├── shared/      (dto: ApiResponse / PagedResponse, exception handler)
│       ├── config/      (SecurityConfig, JwtConfig, SwaggerConfig, AsyncConfig)
│       └── dev/         (DevDataSeeder + DevController para datos/atajos de prueba)
└── frontend/                       ← React Native (Expo)
    ├── App.js
    ├── index.js
    ├── app.json
    └── src/
        ├── api/         (config, axiosConfig, session, subastas, bienes, mediosPago,
        │                 compras, cuentasCobro, me, multas)
        ├── components/  (DniUploadTemplate, BottomNavBar)
        ├── navigation/  (AuthStack)
        ├── screens/
        │   ├── auth/    (Welcome, Login, RegisterStep1, DniFront, DniBack,
        │   │             VerificationPending, CompleteRegistration, RegistroCompleto,
        │   │             RecuperarPassword, LinkEnviado, ResetPassword)
        │   ├── home/    (HomeScreen)
        │   ├── subastas/(DetalleSubasta, PujasEnVivo, DetalleLote, AccesoRestringido,
        │   │             DetalleMulta, FacturaCompra, PagoCompra, ResumenCompra)
        │   ├── products/(MisProductos, DetalleProducto, SolicitarSubastaInfo, SolicitarSubastaForm)
        │   ├── payments/(AddPaymentMethod, FormCuentaBancaria, FormTarjetaCredito, FormCheque,
        │   │             MisCuentasCobro, FormCuentaCobro)
        │   ├── profile/ (ProfileScreen, MiHistorial)
        │   └── settings/(Configuracion, CuentaSeguridad, EditarPerfil, CambiarPassword,
        │                 Notificaciones, Preferencias)
        ├── theme/       (colors.js — NUNCA hexa hardcodeado en StyleSheet)
        └── utils/       (validation.js)
```

---

## 4. Comandos

### Backend
```bash
cd backend
mvn spring-boot:run                       # Puerto 8080 (perfil dev → Supabase)
mvn test                                  # Tests
mvn test -Dtest=NombreTest                # Test puntual
mvn clean package                         # JAR
```

Swagger: http://localhost:8080/swagger-ui.html

### Frontend
```bash
cd frontend
npm install
npm start                                 # Expo dev server
npm run android                           # Levantar en emulador Android
npm run web                               # Browser
```

API base URL (`src/api/config.js`):
- Web → `http://localhost:8080`
- Android emulator → `http://10.0.2.2:8080`

---

## 5. Base de datos (Supabase)

- URL: `jdbc:postgresql://db.zuvlthklfwquowtsqxdd.supabase.co:5432/postgres`
- Compartida por todo el equipo — los datos persisten entre arranques.
- `spring.jpa.hibernate.ddl-auto=update` → Hibernate crea/actualiza las tablas nuevas
  (Usuario, TokenActivacion, MedioDePago, CuentaCobro, BienEnConsignacion, Compra, Multa,
  LoteRemate, etc.) sin tocar las del legacy.
- El esquema legacy (`paises`, `personas`, `clientes`, `duenios`, `subastas`, `productos`,
  `itemsCatalogo`, `pujos`, etc.) está mapeado por entidades JPA en `legacy/entity/`.
  **Las columnas del legacy no se modifican.**

### Entidades nuevas (gestionadas por Hibernate)

| Entidad | Campos clave |
|---------|-------------|
| `Usuario` | id, email UNIQUE, passwordHash, clienteId FK→clientes, estadoKyc (pendiente_kyc / activo / bloqueado), refreshToken |
| `TokenActivacion` | id, token UNIQUE, usuarioId, expiraEn (48 hs), usado boolean |
| `MedioDePago` | id, usuarioId, tipo (cuenta / tarjeta / cheque), moneda (ARS / USD), estado (pendiente / verificado / rechazado), datosEnmascarados, **saldo** (fondos asociados; default ARS 1.000.000 / USD 1.000; cheque = monto declarado) |
| `CuentaCobro` | id, usuarioId, banco, pais, numeroCuenta |
| `BienEnConsignacion` | id, usuarioId, productoId FK→productos, estado (solicitado / en_inspeccion / aceptado / rechazado / asignado / vendido / devuelto) |
| `Compra` | id, usuarioId, itemId FK→itemsCatalogo, **medioPagoId**, montoFinal, comision, costoEnvio, retiraPersonalmente, conSeguroEnvio, estado (pendiente / pagada / impaga), **pagarAntesDe** (72 hs), creadaEn |
| `Multa` | id, usuarioId, **compraId**, importe (10 % del bid), estado (pendiente / pagada / judicial), venceEn (72 hs), creadaEn |
| `LoteRemate` | estado del remate en vivo lote por lote (lote actual, deadline, ya vendidos) |
| `Notificacion` | id, usuarioId, tipo, titulo, mensaje, leida, fecha, entidadTipo, entidadId |
| `Preferencias` 🚫 | id, usuarioId, idioma, tema, flags push/email — **fuera de alcance**: el enunciado no pide preferencias; no se implementará. |

🚫 = descartado (fuera del alcance del enunciado).

---

## 6. Seguridad y autenticación

- `SecurityConfig` ya tiene **JWT activado**, CSRF off, sesión stateless.
- Endpoints públicos: `/auth/registro`, `/auth/completar-registro`, `/auth/kyc-estado/**`,
  `/auth/login`, `/auth/refresh`, `/auth/recuperar-password`, `/auth/resetear-password`,
  `/auth/verificar-disponibilidad`, `/subastas/**`, swagger.
- Todos los demás endpoints requieren `Authorization: Bearer <access_token>`.
- Token de activación de cuenta: válido **48 hs** → expirado devuelve **410 Gone**.
- Token de recuperación de password: válido **30 min**.
- Cambiar password → **invalidar todos los refresh tokens** del usuario.

---

## 7. Convenciones de API

```
Base URL local: http://localhost:8080
Header auth:    Authorization: Bearer {access_token}
Content-Type:   application/json
Excepción:      GET /compras/{id}/factura admite ?formato=json|pdf
```

| Código | Cuándo |
|--------|--------|
| 200 | OK |
| 201 | Recurso creado |
| 204 | Delete OK |
| 400 | Datos inválidos / faltantes |
| 401 | Sin token o inválido |
| 403 | Autenticado pero sin permiso (categoría, multa, estado) |
| 404 | No existe |
| 409 | Conflicto (en uso, ya existe, puja pendiente) |
| 410 | Token de activación expirado |
| 422 | Regla de negocio violada |
| 503 | Falla de integración (sistema central) |

Todas las respuestas viajan dentro del wrapper `ApiResponse<T>`
(`{ success, message, data }`). Las listas, dentro de `PagedResponse<T>`.

---

## 8. Reglas de negocio — validar SIEMPRE en el Service

### Auth / KYC
- Registro en 2 etapas: ① datos + DNI → `pendiente_kyc`;
  ② token generado (en uni se genera solo) → usuario crea password.
- Token de activación 48 hs → expirado **410**.

### Jerarquía de categorías
```
comun < especial < plata < oro < platino
```
Usuario solo ve / se inscribe en subastas con `categoria_subasta ≤ categoria_usuario`.

### Inscripción a una subasta — requiere TODO esto
1. `categoria_usuario ≥ categoria_subasta`
2. Al menos 1 medio de pago **verificado** y compatible con la moneda de la subasta
3. Sin multas en estado `pendiente`
4. No estar ya inscripto en otra subasta abierta simultánea (**una sola activa por usuario**)

### Regla de rango de puja
```
mínimo = mejor_oferta + (1 %  × precioBase del ítem)
máximo = mejor_oferta + (20 % × precioBase del ítem)
```
Excepción: categoría `oro` o `platino` → sin límites.
**Una puja a la vez por ítem:** mientras hay una pendiente de confirmación,
nueva puja → **409**. El campo `orden` se asigna server-side al confirmar.

### Cheque certificado
```
disponible = monto_garantia - Σ(Compra.montoFinal donde estado ∈ {pendiente, concretada})
```

### Multas — flujo real implementado
- Al cerrar, el ganador genera una `Compra` en estado `pendiente` con `pagarAntesDe = now + 72 hs`.
- Si la compra vence sin pago → `Compra.estado = impaga` y se genera `Multa` por el **10 % del bid**.
- La `Multa` vence en **72 hs**; pasada esa ventana sin pago → `judicial`.
- **No hay scheduler:** el barrido es **lazy** (`MultaService.sincronizarVencidas()`), invocado
  antes de lecturas/escrituras sensibles (historial, multas, inscripción, puja).
- Con multa `judicial` → **403** en inscripción y puja (`InscripcionService`, `PujaService`).

### Bienes en consignación
- Requiere ≥ 1 **cuenta de cobro declarada** antes de consignar → **422** si no tiene.
- Mínimo **6 fotos** (base64) → **400** si son menos.
- `declaracionPropiedad` y `origenLicitoAcreditado` deben ser `true` → **400** si no.
- `GET /bienes/{id}/ubicacion-poliza` solo si `estado ∈ {en_inspeccion, aceptado, asignado, vendido}` → **404** en `solicitado`.

### Medios de pago
- No eliminar uno en uso en subasta activa → **409**.
- Moneda del medio debe coincidir con la moneda de la subasta al inscribirse / pujar.
- Cada medio tiene un **`saldo`** (fondos asociados). `SaldoService.alcanza()` valida fondos antes
  de pagar y `SaldoService.debitar()` los descuenta al concretar la compra. Cuenta/tarjeta usan un
  default por moneda; el cheque certificado declara su monto (**422** si falta o ≤ 0).
- `SaldoServiceImpl` (`@Service`) implementa la interfaz y desplaza el stub permisivo `SaldoConfig`
  (`@ConditionalOnMissingBean`).

### Subastas
- Fecha de la subasta = mínimo **10 días** desde su creación.
- Si ningún postor puja por un ítem → la empresa lo compra al precio base al cerrar.
- Subastas en ARS o USD (no bimonetarias).

---

## 9. Endpoints — estado actual

### Auth — `/auth` ✅ implementado
```
POST /auth/registro
GET  /auth/kyc-estado/{usuarioId}            ← polling de la app
POST /auth/completar-registro
POST /auth/login
POST /auth/refresh
POST /auth/recuperar-password
POST /auth/resetear-password
GET  /auth/verificar-disponibilidad
GET  /auth/me
PUT  /auth/perfil                            ← actualizar nombre / dirección
POST /auth/cambiar-password
```

### Subastas — `/subastas` ✅ implementado
```
GET  /subastas                               (filtros: estado, moneda, categoria)
GET  /subastas/{id}
GET  /subastas/{id}/catalogo
GET  /subastas/{id}/catalogo/{itemId}
POST /subastas/{id}/inscribirse
```

### Pujas — `/subastas/{id}/...` ✅ implementado
```
GET  /subastas/{id}/pujas                    (historial ordenado por 'orden')
POST /subastas/{id}/pujar
GET  /subastas/{id}/remate                   ← estado del remate en vivo (polling); cierre lazy del lote vencido
```

### Cuentas de cobro — `/cuentas-cobro` ✅ implementado
```
GET  /cuentas-cobro
POST /cuentas-cobro                          (body: banco, pais, numeroCuenta)
```

### Compras — `/compras` ✅ implementado
```
GET  /compras                                (historial del usuario)
GET  /compras/{id}                           (desglose: monto, comisión, envío, total)
POST /compras/{id}/pagar                     (pago mockeado; descuenta saldo del medio)
GET  /compras/{id}/factura?formato=json|pdf  (PDF mockeado → URL ficticia)
```

### Multas — `/multas` ✅ implementado
```
GET  /multas                                 (filtro por estado)
GET  /multas/{id}
POST /multas/{id}/pagar                       (body: medio_pago_id; pago mockeado)
```

### Perfil / métricas — `/me` ✅ implementado
```
GET  /me/participaciones                     (stats: participadas, ganadas, gastado,
                                              ofertado [Σ pujas], porCategoria [participó/ganó por categoría])
GET  /me/limite-disponible                   (límite del cheque-garantía por moneda:
                                              garantia / utilizado / disponible; tieneGarantia)
```

### Admin subastas — `/admin/subastas` ✅ implementado (sin rol dedicado todavía)
```
POST /admin/subastas/{id}/cerrar             ← martilla todos los lotes y cierra la subasta
```

### Dev — `/dev` ✅ (solo perfil dev, atajos de prueba)
```
POST /dev/admitir-todos
POST /dev/limpiar-pujas
POST /dev/reset-subastas
```

### Medios de pago — `/medios-pago` ✅ implementado
```
GET    /medios-pago
POST   /medios-pago
DELETE /medios-pago/{id}
```

### Bienes — `/bienes` ✅ implementado
```
GET  /bienes
POST /bienes
GET  /bienes/{id}
PUT  /bienes/{id}/aceptar-condiciones
GET  /bienes/{id}/ubicacion-poliza
```

### Admin bienes — `/admin/bienes` ✅ implementado (sin rol dedicado todavía)
```
GET /admin/bienes
GET /admin/bienes/aprobados-disponibles
PUT /admin/bienes/{id}/aprobar
PUT /admin/bienes/{id}/rechazar
```

### Notificaciones — `/notificaciones` ✅ implementado
```
GET  /notificaciones                         (filtro: ?leida=true|false)
PUT  /notificaciones/{id}/leer
PUT  /notificaciones/leer-todas
```

### Consignación (usuario) — endpoints adicionales ✅ implementado
```
PUT  /bienes/{id}/aceptar-condiciones         (sin body; estado aprobado → asignado + notificación)
PUT  /bienes/{id}/rechazar-condiciones        (sin body; estado aprobado → devuelto; gastos = 5% del precio base + notificación)
```
> `FacturaResponse` expone ahora `conSeguroEnvio` y `retiraPersonalmente`.

> Nota: los endpoints de preferencias (`/me/preferencias`, `/me/preferencias-notificaciones`)
> se descartaron — el enunciado no pide preferencias (ver §12 Chunk F).

---

## 10. Frontend — pantallas existentes

✅ **Auth flow completo:** Welcome → Login | Registro (Step1 → DniFront → DniBack
→ VerificationPending [polling 5 s a `/auth/kyc-estado`] → CompleteRegistration → RegistroCompleto)
✅ **Recuperación de password:** RecuperarPassword → LinkEnviado → ResetPassword
✅ **Home** (listado base)
✅ **Subastas:** DetalleSubasta, PujasEnVivo, DetalleLote, AccesoRestringido (precio base solo si aprobado)
✅ **Compras / multas (UI):** ResumenCompra, PagoCompra, FacturaCompra, DetalleMulta
✅ **Productos del usuario:** MisProductos, DetalleProducto, SolicitarSubastaInfo, SolicitarSubastaForm
✅ **Medios de pago:** AddPaymentMethod (muestra saldo) + FormCuentaBancaria + FormTarjetaCredito + FormCheque
✅ **Cuentas de cobro:** MisCuentasCobro + FormCuentaCobro
✅ **Profile:** ProfileScreen (badge categoría + card "Garantía disponible" por moneda),
   MiHistorial (stats participadas/ganadas/gastado/ofertado + desglose "Por categoría")
✅ **Settings:** Configuracion, CuentaSeguridad (enlaza a EditarPerfil y CambiarPassword, ya
   funcionales), EditarPerfil (conectado a `PUT /auth/perfil`), CambiarPassword (conectado a
   `POST /auth/cambiar-password`)
🚫 **Settings (fuera de alcance):** Preferencias y Notificaciones (settings) son placeholders
   **locales** (solo AsyncStorage) — el enunciado no pide preferencias; no se conectan a backend.
✅ **API helpers:** `axiosConfig` con interceptor JWT, `session` (AsyncStorage),
   módulos `subastas`, `bienes`, `mediosPago`, `compras`, `cuentasCobro`, `me`, `multas`

⛔ **Faltan / incompletas:** falta bottom-tabs (Chunk I). Ver "Tareas pendientes" abajo.

---

## 11. Reglas de código

### Backend
- **Idioma:** English en clases, métodos, variables, comentarios y mensajes de error de la API.
- **DTOs separados de entidades.** Usar `record` para DTOs de respuesta (Java 17).
- **Bean Validation** (`@NotNull`, `@Size`, `@Email`, `@Pattern`) en todos los DTOs de request.
- **Nunca** lógica de negocio en el Controller. El controller valida input y delega.
- `GlobalExceptionHandler` (`@RestControllerAdvice`) centraliza todos los errores.
- **Lombok** para reducir boilerplate en entidades JPA.
- **Paginación** con `Pageable` en todos los listados.
- Tests: JUnit 5 + Mockito. Spring Security Test para endpoints securizados.

### Frontend
- **Colores:** prohibido hexa en `StyleSheet`. Importar siempre de `src/theme/colors`.
- **API URL:** usar `API_URL` de `src/api/config.js` — nunca hardcodear.
- **Token:** se inyecta automáticamente por el interceptor de `axiosConfig`. No tocar headers a mano.
- **Imágenes base64:** `quality: 0.2` en ImagePicker, limpiar con
  `str.replace(/[^A-Za-z0-9+/=]/g, "")`. Nunca enviar el prefijo `data:image/...`.
- **Estilos:** `StyleSheet.create` al final del archivo.
- **Errores:** `try/catch` + `Alert.alert` con mensaje legible al usuario.
- **Reutilizar** `DniUploadTemplate.js` para cualquier captura/carga de imagen.
- **Nombres de pantalla** alineados con los frames de Figma.

---

## 12. Tareas pendientes — roadmap por chunks

> Cruzado con el enunciado `TPO_DAI_1C2026.docx`. Cada chunk es una unidad funcional testeable
> con su parte **backend** y **frontend**. El orden C→J es la secuencia sugerida.
> Chunks A (cuentas de cobro), B (cierre de subasta + compras), C (notificaciones), D (métricas +
> límite del cheque-garantía) ya están **implementados**, igual que multas, remate en vivo,
> participaciones y el saldo de medios de pago.

### Chunk C — Notificaciones / "mensajes privados" ✅
> Enunciado: al ganar se informa **por mensaje privado** el importe a pagar (pujado + comisiones +
> envío); también avisos de bien aceptado/rechazado, multa, etc.

✅ **Backend:** entity `Notificacion` + repo + service + controller.
  `GET /notificaciones?leida=true|false`, `PUT /notificaciones/{id}/leer`, `PUT /notificaciones/leer-todas`.
  Disparadores implementados: KYC aprobado, lote ganado (con monto/comisión/total), multa generada/judicial,
  bien aceptado/rechazado, puja superada.
✅ **Frontend:** `NotificacionesInbox.js` con pull-to-refresh, icono por tipo, punto azul no leídas,
  "Marcar todas". Acceso: icono campanita en Home + "Notificaciones" en ProfileScreen.

### Chunk D — Métricas y límite del cheque-garantía ✅
> Enunciado: métricas de participación (asistió, ganó, importes…) y que las compras no superen la
> garantía declarada (cheque certificado) mientras alcance.

✅ **Backend:** `GET /me/limite-disponible` calcula la garantía **por moneda** (ARS/USD por separado):
  `garantia = Σ saldo de cheques verificados`, `utilizado = Σ Compra.montoFinal en {pendiente, pagada}`
  (según la moneda de la subasta de cada compra), `disponible = garantia − utilizado`; solo devuelve
  monedas con cheques (`tieneGarantia=false` si no hay). `ParticipacionStats` ampliado con `ofertado`
  (Σ pujas del cliente) y `porCategoria` (participó/ganó por categoría). DTOs: `LimiteGarantiaMoneda`,
  `LimiteDisponibleResponse`, `CategoriaMetric`. Lógica en `ParticipacionService`.
  > **Nota:** el enforcement del límite al pagar NO se agregó (alcance acordado: solo lectura + UI).
  > El débito del saldo del cheque en `SaldoService.debitar()` ya acota un cheque al concretar la compra.
✅ **Frontend:** `ProfileScreen` muestra el badge de categoría + card "Garantía disponible" por moneda;
  `MiHistorial` agrega el stat "Ofertado" (grid 2×2) y la sección "Por categoría". API: `getLimiteDisponible()`
  en `src/api/me.js`.

### Chunk E — Mejora de categoría del usuario
> Enunciado: "la **diversidad de los medios de pago** del usuario y su **actividad** en las subastas
> permiten mejorar su categoría".

- **Backend:** recalcular `clientes.categoria` (comun→especial→plata→oro→platino) según nº de tipos
  de medio verificados + actividad (participaciones/ganadas). Recalcular al verificar un medio y al
  cerrar una subasta.
- **Frontend:** mostrar la categoría actual y una pista de cómo mejorarla.

### Chunk F — Configuración de perfil ✅ / Preferencias 🚫 (fuera de alcance)
> El enunciado pide gestionar perfil y clave, **no** preferencias (idioma/tema/push-email).

✅ **Configuración de perfil (parte del enunciado, hecha):** `EditarPerfil` conectado a
  `PUT /auth/perfil` (maneja 409/401, refresca tokens) y `CambiarPassword` conectado a
  `POST /auth/cambiar-password` (valida min 8 + confirmación, maneja 400/422/401). Backend ya
  implementado en `AuthController` (`PUT /auth/perfil`, `POST /auth/cambiar-password`, `GET /auth/me`).
🚫 **Preferencias (descartado):** el enunciado no menciona idioma/tema/push-email. Las pantallas
  `Preferencias.js` y settings `Notificaciones.js` quedan como placeholders locales (AsyncStorage),
  sin entity ni endpoints. Hacer dark-mode/i18n "de verdad" exigiría ThemeContext + librería i18n +
  traducir todos los strings (refactor grande) → se omite por no estar en el alcance.

### Chunk G — Flujo de consignación completo ✅
> Enunciado: el usuario puede **no aceptar** valor base/comisiones → devolución con gastos; puede
> **ver las causas del rechazo** del bien; el **retiro personal** del bien comprado pierde el seguro.

✅ **Req #1 — usuario rechaza condiciones:** `PUT /bienes/{id}/rechazar-condiciones` (sin body) →
  `estado = devuelto`, `gastosDevolucion = 5% del precioBasePropuesto`, notificación `BIEN_DEVUELTO`
  con importe. `PUT /bienes/{id}/aceptar-condiciones` refactorizado (sin body, agrega notificación
  `BIEN_CONDICIONES_ACEPTADAS`). `BienDetail` / `BienListItem` exponen `gastosDevolucion`.
  `DetalleProducto.js`: botones Aceptar/Rechazar (cuando `estado=aprobado`); aviso de gastos
  (cuando `estado=devuelto`).
✅ **Req #2 — ver causa de rechazo de la empresa:** ya estaba implementado (`motivoRechazo` en
  `BienDetail`, `DetalleProducto.js` lo muestra). No se modificó.
✅ **Req #3 — retiro personal pierde seguro:** backend ya implementado en `CompraService.pagar`.
  `FacturaResponse` expone `conSeguroEnvio` y `retiraPersonalmente`. `PagoCompra.js`: toggle
  "Seguro de envío" visible solo cuando se elige envío. `FacturaCompra.js`: muestra
  "Seguro de envío: Incluido / Sin seguro".

### Chunk H — Pujas en tiempo real ✅
> Enunciado: los usuarios conectados reciben **en tiempo real** las modificaciones de las ofertas
> (subasta dinámica ascendente).

✅ **Backend (WebSocket/STOMP):** `spring-boot-starter-websocket` + `WebSocketConfig`
  (`@EnableWebSocketMessageBroker`, simple broker `/topic`, endpoint `/ws` sin SockJS).
  `RemateBroadcaster` (usa `SimpMessagingTemplate` + `RemateService.estado()`) publica el
  `RemateEstadoResponse` **crudo** en `/topic/subastas/{id}`. `PujaService.pujar()` dispara el
  broadcast **after-commit** (`TransactionSynchronization`). `/ws/**` agregado a `permitAll`
  (el socket es solo lectura; no empuja datos sensibles → sin JWT en el handshake).
✅ **Frontend:** `src/api/remateSocket.js` (`@stomp/stompjs` sobre WebSocket nativo, URL `ws://`
  derivada de `API_URL`, reconnect 3 s). `PujasEnVivo.js` se suscribe al topic: al recibir un push
  actualiza mejor oferta/líder + reloj al instante y refresca el historial; el indicador "EN VIVO"
  pasa a verde con el socket conectado / ámbar "CONECTANDO" en fallback.
- **Polling retenido (2 s):** red de seguridad si el socket se cae **y** disparador del cierre lazy
  del lote (martillo) cuando vence el reloj. El anuncio "¡Martillo!" vive solo en el polling.
- Validaciones ya existentes (sin cambios): rango **1 %–20 %** antes de enviar, **403** (multa/
  inscripción), **422** (fuera de rango), lote cerrado. Las pujas viajan por `POST /subastas/{id}/pujar`.

### Chunk I — Navegación / UX global (frontend)
- Separar `AuthStack` (no logueado) de `AppStack` con **bottom tabs** (Home, Mis productos,
  Notificaciones, Perfil). Manejo global de **401** en el interceptor (limpiar sesión → Login).
  Splash + ícono final. Verificar que ninguna pantalla use hexa fuera de `theme/colors.js`.
  Mensajes de error con `Alert.alert` consistentes + estado de loading en cada request.

### Chunk J — Calidad y despliegue (entregable 3ra entrega)
- Tests unitarios de services críticos (`InscripcionService`, `PujaService`, `CierreSubastaService`,
  `MultaService`, `AuthService`) + happy-path de integración (login → ver subasta → inscribirse → pujar).
- Desplegar el backend accesible (Render / Railway / Fly.io) con **secrets por env vars**
  (`app.jwt.secret`, password de Supabase), no hardcodeados.
- Build de Expo (EAS / `expo publish`) instalable en dispositivo. Actualizar `README.md` (hoy vacío)
  y mantener Swagger sincronizado (`@Operation` / `@ApiResponses` en cada endpoint nuevo).

### Fuera de alcance / opcional (mencionado en el enunciado)
- Subasta **"colección"** con el nombre del usuario cuando hay muchos artículos de un mismo dueño.
- **Aumentar el valor de la póliza** contactando a la aseguradora y pagando la diferencia del premio.
- **Streaming** de la subasta (el enunciado lo excluye explícitamente del desarrollo).

---

## 13. Orden sugerido de implementación

Chunks **A** (cuentas de cobro), **B** (cierre + compras), **C** (notificaciones), **D** (métricas +
límite del cheque-garantía), **G** (consignación completo) y **H** (pujas en tiempo real vía
WebSocket/STOMP) ✅ hechos. **Chunk F** cerrado (perfil + clave ya conectados; preferencias descartadas
por no estar en el enunciado). **Chunk E** en progreso (compañero de equipo). Sigue:

1. **Chunk I** — Bottom tabs + separación AuthStack/AppStack + 401 global (front).
2. **Chunk J** — Tests, despliegue, README y Swagger (3ra entrega).

---

## 14. Glosario rápido (legacy → app)

| Legacy | App |
|--------|-----|
| `personas` + `clientes` | Usuario postor |
| `personas` + `duenios` | Usuario dueño de bienes |
| `productos` | Bien físico (puede o no estar en una subasta) |
| `catalogos` + `itemsCatalogo` | Lo que se subasta en una `subasta` |
| `asistentes` | Inscripción de un cliente a una subasta |
| `pujos` | Cada puja individual |
| `registroDeSubasta` | Cierre — quién compró qué a quién, a cuánto, con qué comisión |
| `seguros` | Póliza del bien mientras está en consignación |