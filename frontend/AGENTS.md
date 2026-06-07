# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

Esta guía define los estándares técnicos y las reglas de integración para el desarrollo del frontend de SubastaPro. Toda IA o desarrollador que contribuya debe seguir estas directrices para mantener la compatibilidad con el backend.

---

## 1. Stack Tecnológico

- **Framework:** React Native con Expo.
- **Manejo de estado:** `useState` y `useEffect` (Hooks nativos).
- **Conectividad:** `axios`.
- **Navegación:** `react-navigation` (Stack Navigator).

---

## 2. Wireframes & Diseño

- **Figma:** https://www.figma.com/design/kbc5MXvzF8xcswsv21En1a/TPO-DAI-%E2%80%94-Wireframes-Registro--Copy-
- Before implementing any screen, check the corresponding wireframe in Figma.
- Screen naming in code must match the frame names in Figma (e.g. `RegisterStep1.js` → frame "3 — Datos personales").

---

## 3. Reglas de Diseño (Theme)

- **Colores:** Prohibido el uso de colores hexadecimales en `StyleSheet`.
- **Fuente:** Importar siempre desde `src/theme/colors.js`.
- **Estándar:**
```js
  import { colors } from '../../theme/colors';
```

---

## 4. Integración Backend (Reglas Críticas)

- **API URL:** El endpoint base es `http://10.0.2.2:8080` (configurado para Android Emulator).

### Manejo de Imágenes (Base64)

- **Calidad:** Usar `quality: 0.2` en `ImagePicker` para evitar errores de memoria (`500 Internal Server Error`).
- **Formato:** El backend recibe Base64 puro.
- **Limpieza:** Es obligatorio ejecutar la siguiente limpieza antes de enviar el payload:
```js
  const cleanBase64 = (str) => str.replace(/[^A-Za-z0-9+/=]/g, "");
```
- **Validación:** No enviar nunca el prefijo `data:image/...`.

---

## 5. Flujo de Registro (Contrato de Navegación)

1. **Datos Básicos:** `RegisterStep1.js` → `paisId` debe ser `32` (Argentina).
2. **Carga Documental:** `DniFront.js` → `DniBack.js`.
3. **Validación:** `VerificationPending.js` → Polling cada 5s a `/auth/kyc-estado/{usuarioId}`.
4. **Finalización:** `CompleteRegistration.js` → Enviar `tokenActivacion` y `password` para activar cuenta.

---

## 6. Base de Datos (Backend Dev)

- **Modo:** H2 In-Memory (`jdbc:h2:mem:testdb`).
- **Comportamiento:** Los datos se reinician al detener el servidor de Spring Boot.
- **Seeder:** Datos de prueba inicializados en `DevDataSeeder.java`.

---

## 7. Instrucciones para IA

- Al generar código nuevo, mantener la estructura de carpetas `src/screens`, `src/components`, `src/navigation`.
- Los estilos deben seguir el patrón `StyleSheet.create` al final de cada archivo.
- Priorizar la reutilización del componente `DniUploadTemplate.js` para cualquier funcionalidad de carga de imágenes.
- Asegurar siempre el manejo de errores con `try-catch` y alertas nativas de React Native (`Alert.alert`).