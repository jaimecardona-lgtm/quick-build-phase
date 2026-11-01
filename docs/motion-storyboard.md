# Storyboard del hero cinematográfico

Componente: `src/components/experience/CinematicHero.tsx`. Estilos: `cinematic.css`. Medios: `src/lib/cinematic-assets.ts`.
Activación en desarrollo local: `.env.development` → `VITE_LOGIXTIC_MOTION_V2=true`. Producción: `false` por defecto. Para ver el hero original, pon `false` en `.env.development` o crea `.env.local` con `VITE_LOGIXTIC_MOTION_V2=false`.

## Estado

- **Parcial.** No hay video cinematográfico aprobado en el repositorio. Los capítulos usan fotografías fijas existentes con movimiento de cámara controlado por scroll (escala y desplazamiento del plano).
- Capítulo D (dispositivo): la tablet es un marco CSS con la captura real del producto. **Falta un plato fotográfico de tablet** (`public/media/cinematic/tablet-plate.webp`).
- Capítulo C (aéreo): omitido. No hay footage aéreo aprobado.
- Ver bloqueos en [cinematic-asset-audit.md](./cinematic-asset-audit.md).

## Capítulos (progreso del track, 0–1)

| Capítulo | Rango | Plano | Qué ocurre |
| --- | --- | --- | --- |
| H0 | 0.00–0.20 | `logixtic-port-hero.webp` (puerto nocturno) | Asentamiento lento de la cámara; copy legible con velo |
| H1 | 0.20–0.47 | Mismo plano | Ascenso simulado (escala 1.0→1.16 y desplazamiento vertical); el velo se intensifica |
| H2 | 0.47–0.68 | `closing-globe-v2.webp` | El puerto se desvanece; aparece el globo con arcos de datos (dorado) |
| H3 | 0.68–0.85 | Globo atenuado | La tablet sube con perspectiva (rotateX 26°→0) |
| H4 | 0.85–1.00 | `01-plataforma-servicios-menu.webp` (captura real) | La pantalla de Logixtic se revela; aparecen los paneles |

El timeline es único y scrubbed, así que el scroll hacia atrás rebobina todos los capítulos.

## Copy

Ningún texto nuevo. Todo el copy visible sale de `useLanguage().content.hero`. Las imágenes son decorativas (`alt=""`, `aria-hidden`).

## Estados

| Condición | Comportamiento |
| --- | --- |
| Escritorio ≥ 1024 px sin movimiento reducido | Track de 320vh con sticky de 100vh y timeline scrubbed |
| Móvil / tablet / movimiento reducido | Plano fijo a pantalla completa, copy, captura real. Sin pin, sin globo, sin scroll-jacking |

## Límites conocidos

- Sin video, el efecto de cámara es una escala sobre una fotografía fija. No equivale a un travelling real.
- Los planos del puerto y del globo tienen procedencia no documentada (ver manifiesto de licencias).
- El globo se ve en resolución baja (680 px) en un marco pequeño.
- Probado solo en Chromium (Firefox y WebKit no están instalados en este equipo).
