# Backlog de seguridad y permisos

Riesgos detectados en la auditoría del sprint 01. Ninguno se corrige en este sprint salvo que se indique; la ruta `/planeacion` se conserva.

## Prioridad alta

### SEC-01 · `/planeacion` sin control de acceso

- **Evidencia:** `src/routes/planeacion.tsx` renderiza `PlanningApp` sin guard. `src/lib/planning/store.tsx` guarda el estado completo en `localStorage` (`window.localStorage.setItem`).
- **Riesgo:** cualquier visitante con la URL ve y edita la planeación interna. El único control es `robots: noindex`, que no es un control de acceso. Los datos quedan en el navegador de cada persona.
- **Medidas propuestas:**
  1. Antes de producción: retirar la ruta del build público o protegerla detrás de autenticación de Lovable Cloud (Fase 4).
  2. No exponer datos internos en producción: no publicar la ruta hasta resolver el punto 1.
  3. Migrar el estado a base de datos con RLS por rol, no a `localStorage`.
- **Estado:** pendiente. Sin cambios en este sprint.

### SEC-02 · Ausencia de autenticación y autorización en el backend

- **Evidencia:** no existe API propia en el repositorio antes de este sprint. El backend FastAPI nuevo (`backend/`) solo expone `health` y configuración pública.
- **Riesgo:** cuando se agreguen endpoints de ROI o IA, sin validación de JWT se expondrían datos de clientes y costos.
- **Medidas propuestas:** validar JWT (emisor, audiencia, firma, expiración) con JWKS o el método soportado por Lovable Cloud Auth; RBAC en la API; sin contraseñas propias.

### SEC-03 · Agente de IA es simulado

- **Evidencia:** `src/components/site/LogixAI.tsx` muestra respuestas estáticas.
- **Riesgo:** el sitio no debe afirmar capacidades que no existen. El copy comercial ya describe la función; se mantiene sin cambios (ver [content-baseline.md](./content-baseline.md)).
- **Medidas propuestas:** integración real solo en Fase 5, con permisos por rol, allowlist de herramientas, rate limiting y presupuesto.

## Prioridad media

### SEC-04 · Modelo de permisos CMS (Fase 4)

- Roles previstos: `editor`, `commercial`, `publisher`, `admin`.
- Contenido por sección e idioma, con versiones, borradores, aprobaciones y auditoría.
- La web pública seguirá sin login. Los roles solo aplican al panel interno.
- Matriz de permisos a definir con el equipo antes de crear tablas.

### SEC-05 · RLS para tablas consultadas desde el frontend

- Toda tabla accesible con la clave pública del frontend debe tener RLS activa.
- Las llamadas privilegiadas desde FastAPI usan autorizaciones explícitas; nunca la clave de servicio en el navegador.
- No crear tablas hasta confirmar el entorno de Lovable Cloud.

### SEC-06 · Secretos y configuración

- `.env`, claves y tokens fuera de Git (`backend/.gitignore`, `.gitignore`).
- `backend/.env.example` sin valores reales.
- `OPENROUTER_API_KEY` solo en el backend, nunca en variables `VITE_*`.

### SEC-07 · Agente de IA: exposición de datos (Fase 5)

- Conocimiento solo desde contenido aprobado y público; sin acceso a información confidencial ni a tenants no autorizados.
- Herramientas allowlisted: `search_public_knowledge`, `calculate_roi`, `create_demo_request`.
- Telemetría sin tokens, sesiones ni datos personales.

## Prioridad baja

### SEC-08 · Cabeceras y CSP

- Revisar `Content-Security-Policy` y cabeceras de seguridad al desplegar en staging.

## Estado

| ID | Tema | Fase | Estado |
| --- | --- | --- | --- |
| SEC-01 | `/planeacion` | antes de publicar | pendiente |
| SEC-02 | Auth en API | 4 | pendiente |
| SEC-03 | Agente simulado | 5 | conocido |
| SEC-04 | Permisos CMS | 4 | pendiente |
| SEC-05 | RLS | 4 | pendiente |
| SEC-06 | Secretos | 1B | parcial (`.gitignore`, `.env.example`) |
| SEC-07 | Datos del agente | 5 | pendiente |
| SEC-08 | CSP | 6 | pendiente |
