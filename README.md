# SubastaPro

Aplicación móvil para una empresa que organiza **subastas presenciales de arte y bienes de alta
gama**. Permite a los usuarios participar online (puja en vivo), solicitar la consignación de
bienes propios, gestionar sus medios de pago y ver su historial.

**TPO — Desarrollo de Aplicaciones Interactivas (DAI), UADE 1C2026 · Comisión Martes Tarde**

- **Integrantes:** Forteza Simón · Addamo Juan Segundo · Dillon Lucio
- **Docentes:** Goddio Claudio · Narducci Adrian

---

## 🌐 Deploy

| Recurso | URL |
|---------|-----|
| **Backend (API)** | https://tpodesarrollomovil-production.up.railway.app |
| **Swagger UI** | https://tpodesarrollomovil-production.up.railway.app/swagger-ui.html |
| **OpenAPI JSON** | https://tpodesarrollomovil-production.up.railway.app/v3/api-docs |

- **Backend:** deployado en **Railway** (build con Nixpacks, sin Docker).
- **Base de datos:** **Supabase PostgreSQL** (compartida), conectada vía **Session pooler** (IPv4).
- **Secrets:** inyectados por variables de entorno en Railway (no hardcodeados). Ver
  [Deploy del backend](#deploy-del-backend-railway).

### Cuenta de prueba

| Email | Password |
|-------|----------|
| `test@subastapro.com` | `password123` |

Usuario con KYC activo, categoría **plata** y una tarjeta ARS verificada con saldo (sirve para
inscribirse y pujar).

---

## 🧱 Stack

### Backend
- Java 17 · Spring Boot 3.4.5 · Spring Data JPA + Hibernate
- PostgreSQL (Supabase) / H2 (tests)
- Auth con JWT (access + refresh) · Maven · Lombok
- OpenAPI 3 / Swagger UI

### Frontend
- React Native + Expo SDK 56
- Estado con Hooks (`useState` / `useEffect`)
- `axios` (interceptor que inyecta el JWT) · `@react-navigation/native-stack`
- `@react-native-async-storage/async-storage` · pujas en vivo con `@stomp/stompjs` (WebSocket)

---

## 📁 Estructura

```
TPO_Desarrollo_Movil/
├── backend/    ← Spring Boot (API REST + WebSocket)
└── frontend/   ← React Native (Expo)
```

Documentación completa del dominio, reglas de negocio y endpoints: ver [`CLAUDE.md`](CLAUDE.md).

---

## 🚀 Cómo correr en local

### Backend

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

- Levanta en **http://localhost:8080** con el perfil `dev` (apunta a la Supabase compartida).
- Swagger local: http://localhost:8080/swagger-ui.html

```bash
./mvnw test                   # correr tests (perfil test → H2 en memoria)
./mvnw clean package          # generar el JAR
```

### Frontend

```bash
cd frontend
npm install
npx expo start                # Expo dev server (abrir en Expo Go)
```

La URL del backend se controla en [`frontend/src/api/config.js`](frontend/src/api/config.js) con la
constante `USE_REMOTE`:

- `USE_REMOTE = true` → apunta al backend deployado en Railway (**default**, para demo / dispositivo real).
- `USE_REMOTE = false` → apunta al backend local (`http://10.0.2.2:8080` en emulador Android,
  `http://localhost:8080` en web / iOS sim).

---

## ☁️ Deploy del backend (Railway)

El backend se buildea con **Nixpacks** (autodetección del proyecto Maven, sin Dockerfile).
Configuración en Railway:

- **Root Directory:** `backend`
- **Variables de entorno:**

  | Variable | Descripción |
  |----------|-------------|
  | `SPRING_PROFILES_ACTIVE` | `prod` |
  | `SPRING_DATASOURCE_URL` | JDBC del **Session pooler** de Supabase (puerto 5432) |
  | `SPRING_DATASOURCE_USERNAME` | `postgres.<project-ref>` |
  | `SPRING_DATASOURCE_PASSWORD` | password de Supabase |
  | `APP_JWT_SECRET` | secret para firmar los JWT (string largo, ≥ 32 chars) |
  | `PORT` | lo inyecta Railway automáticamente |

> **Nota:** la conexión **directa** de Supabase (`db.<ref>.supabase.co:5432`) es IPv6-only y falla
> desde Railway (`Network is unreachable`). Por eso se usa el **Session pooler** (IPv4).

El perfil `prod` ([`application-prod.properties`](backend/src/main/resources/application-prod.properties))
lee la conexión y los secrets desde estas variables.

---

## 📡 Convenciones de la API

- Base URL: la del deploy (o `http://localhost:8080` en local).
- Auth: header `Authorization: Bearer {access_token}`.
- Todas las respuestas viajan dentro del wrapper `ApiResponse<T>` (`{ success, message, data }`);
  los listados dentro de `PagedResponse<T>`.

El listado completo de endpoints está en Swagger UI y en [`CLAUDE.md`](CLAUDE.md) (§9).
