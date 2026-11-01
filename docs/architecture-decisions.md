# Decisiones de arquitectura

Estado al cierre del sprint 01 (fecha de corte 31-10-2026).

## ADR-01 · Hero nuevo detrás de feature flag, Hero original como fallback

- **Decisión:** `src/routes/index.tsx` elige entre `Hero` y `CinematicHero` según `import.meta.env["VITE_LOGIXTIC_MOTION_V2"] === "true"`. `CinematicHero` se carga con `React.lazy`.
- **Por qué:** permite revisar el Hero nuevo en desarrollo sin afectar producción ni al Hero aprobado.
- **Consecuencia:** el valor por defecto es `false`. Activarlo en Lovable requiere definir la variable en su entorno; no se activa en producción sin revisión.

## ADR-02 · GSAP ScrollTrigger solo para la secuencia de escritorio

- **Decisión:** `gsap@3.15.0` (versión fijada) con `ScrollTrigger`. La línea de tiempo corre solo con `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`, mediante `gsap.matchMedia`.
- **Alternativas descartadas:**
  - Motion for React para la secuencia: no tiene el control de scrub por scroll que necesitamos.
  - Solo CSS con `animation-timeline: view()`: soporte de navegadores insuficiente para una experiencia que debe degradar bien.
  - Three.js / WebGL: no hace falta; el prompt pide 2.5D como primera opción.
- **Motion for React:** no se añadió. Las microinteracciones del sitio ya usan CSS y el hook `useReveal`; añadir otra librería de animación no aporta nada hoy.

## ADR-03 · Sin pin ni scroll-jacking

- **Decisión:** en escritorio el sticky es de `100vh` dentro de un track de `200vh`, sin `pin` de ScrollTrigger y sin bloquear el scroll. En móvil y con movimiento reducido no hay sticky.
- **Por qué:** el prompt pide control predecible sin competir con el scroll de la página.

## ADR-04 · Solo `transform` y `opacity`

- **Decisión:** todas las animaciones usan `x`, `y`, `scale` y `opacity`. Las rutas se revelan con `opacity` (no con `stroke-dashoffset`), para no animar propiedades de layout ni de trazo.

## ADR-05 · Ilustraciones originales en código

- **Decisión:** se retiraron los vehículos SVG del hero. Los medios cinematográficos deben ser fotografía o video reales aprobados (ver docs/cinematic-asset-audit.md).

## ADR-06 · Sin dependencias nuevas de UI

- **Decisión:** se reutilizan `DemoButton`, `Button`, `track`, `WHATSAPP_URL` y los íconos de `lucide-react` ya instalados.
- **Duplicación aceptada:** la estructura del copy del Hero se repite en `CinematicHero.tsx` en lugar de extraerse a un componente compartido, para no modificar `Hero.tsx` durante el sprint.

## ADR-07 · Backend FastAPI independiente

- **Decisión:** servicio en `backend/`, con `.venv` propio, Python 3.12, FastAPI, Pydantic 2 y `pydantic-settings`. Sin base de datos en este sprint.
- **Por qué:** Lovable Cloud no ejecuta servidores Python; el backend se despliega aparte (Render u otra infraestructura, por decidir).
- **Detalle:** el contrato de OpenRouter es un `Protocol` con implementación de dry-run. `AGENT_DRY_RUN=true` por defecto.

## ADR-08 · Prueba de preservación del copy

- **Decisión:** `scripts/verify-content-preservation.mjs` compara el copy de `src/lib` y `src/components/site` con un baseline versionado (`scripts/content-baseline.json`). Usa el compilador de TypeScript, sin dependencias nuevas.
- **Por qué:** es la forma más fiable de garantizar que ningún cambio de copy llegue por accidente.

## ADR-09 · Sin cambios en `routeTree.gen.ts` ni en el resto de secciones

- `src/routeTree.gen.ts` no se editó. Las rutas no cambiaron.
- Las secciones `ClientsReel` a `Footer` no se modificaron.

## ADR-10 · Fuera de alcance en este sprint

- CMS, autenticación, RLS, roles, RAG, agente de IA real, calculadora ROI interna y tracking con capturas (Fases 2 a 6).
- `/planeacion` se conserva sin cambios; ver [security-backlog.md](./security-backlog.md) (SEC-01).
