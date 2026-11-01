# Redistribución visual de la home

Fecha: 31-10-2026. Regla: ninguna palabra de copy cambia (`bun run verify:content` = OK, 1.288 cadenas). Solo cambia la forma visual y la narrativa de movimiento.

## Auditoría de la home actual (orden real en `src/routes/index.tsx`)

| # | Sección | Estado visual antes del sprint | Recurso visual disponible |
| --- | --- | --- | --- |
| 1 | Hero (`cinematic`/`Hero`) | Fotografía de puerto + tablet con captura real | `logixtic-port-hero.webp` (procedencia pendiente), `01-plataforma-servicios-menu.webp` |
| 2 | ClientsReel | Carrusel de logos | Logos restaurados |
| 3 | OperationalChallenges | Tarjetas con imágenes | Fotos en `src/assets/operational-challenges` |
| 4 | Problem | Tarjetas planas | Sin medio nuevo |
| 5 | SuccessStories | Video de cliente (YouTube) | Externo |
| 6 | Flow (`#plataforma`) | Capturas reales por etapa + portal | `02…08` |
| 7 | LogixAI (`#logix-ai`) | Personaje **Logix** (robot) + respuestas simuladas | `logix-transparent.png` |
| 8 | Evidence (`#clientes`) | Mapa de presencia regional + casos | Mapa propio (`americas-map.ts`) |
| 9 | Implementation | Seis etapas | Sin medio |
| 10 | Plans | Planes | Sin medio |
| 11 | Faq | Acordeón | Sin medio |
| 12 | Closing | Logo y CTA | `logixtic-closing-official.png` |
| 13 | Footer | Sellos de cumplimiento | Sellos restaurados |

**Nota de nombre:** en el repositorio no existe el nombre «Agentix». El personaje de la sección de IA se llama **Logix** en el copy y en el alt. Se mantiene el personaje y el copy sin cambios.

## Propuesta de estructura visual (sección por sección)

| Sección | Recurso visual | Movimiento | Estado |
| --- | --- | --- | --- |
| Hero | Puerto nocturno → tablet con captura real | Scroll scrub de 320vh, sin globo | **Implementado** |
| Tracking / trazabilidad | Rutas aéreas, marítimas, ferrocarril y terrestres | Trayectorias y hitos | **Pendiente**: requiere fotografía o video aprobado de aviones, buques, trenes y camiones |
| Presencia regional | Mapa original + halo que respira | Halo autónomo; viajeros y rutas del mapa | **Implementado** (sin cambiar datos ni etiquetas) |
| Cobertura global | Globo con arcos de conexión | Flotación, anillos, arcos fluyendo, nodos pulsando | **Implementado**, dentro de la sección de presencia |
| Plataforma / producto | Tablet con capturas reales | Scroll | **Parcial**: capturas en el hero; falta una pantalla dedicada |
| Agentix / Logix (IA) | Personaje Logix | Halo y flotación autónomos | **Implementado** |
| ROI / ahorro | Visualización de ahorro | Interactiva | **Pendiente**: no hay cifras de ROI en el repositorio; el diagnóstico es un sitio externo |
| Resto del sitio | Sistema de luces y gradientes | Ritmo de animación uniforme | **Pendiente**: solo se tocaron las secciones anteriores |

## Qué se implementó en este corte

1. **Hero:** el globo salió de la narrativa del barco. La secuencia es puerto → tablet con captura real → paneles. Cambios: `src/components/experience/CinematicHero.tsx`, `cinematic.css`.
2. **Cobertura global:** `src/components/experience/GlobalCoverage.tsx` y `global-coverage.css`, insertado en `src/components/site/Evidence.tsx` entre el mapa y los casos. Movimiento en bucle con CSS.
3. **Mapa de presencia regional:** halo animado (`logistics-routes.css`). Sin cambios de datos.
4. **Personaje Logix:** halo y flotación autónomos (`logix-motion.css`), importado desde `LogixAI.tsx`.

## Limitaciones honestas

- El globo es una imagen plana de 680×388 px. **No rota en 3D**: el movimiento es flotación, arcos y nodos. Un globo rotatorio real requiere un video o modelo aprobado.
- No hay videos ni fotografías aprobadas de aviones, buques, trenes o camiones en tránsito. Por eso la sección de tracking no se construyó: no se sustituye por vectores.
- El hero sigue usando una fotografía fija con escala de cámara, no un travelling real.

## Medios que faltan (bloqueo)

- Video de puerto con ascenso (para el hero).
- Video o fotografías de aviones, buques, trenes de contenedores y camiones (tracking).
- Video o modelo de globo rotatorio (cobertura global).
- Plato fotográfico de tablet (`public/media/cinematic/tablet-plate.webp`).
- Derechos documentados para el puerto y el globo (procedencia no documentada).

Ver `docs/cinematic-asset-audit.md` y `public/media/cinematic/license-manifest.json`.
