# Inventario de medios cinematográficos (verificado con ffprobe)

Masters en `public/media/cinematic/` (ver nota de publicación abajo). Derivados web generados con ffmpeg: H.264, yuv420p, faststart, sin audio, 30 fps, CRF 27. Posters WebP extraídos de un fotograma.

| Id | Master | Master (resolución, duración) | Derivado web | Poster | Uso | Revisión de marca |
|---|---|---|---|---|---|---|
| sea | barco.mp4 | 3840×2160, 18.4 s | barco-720.mp4 (1280×720, 12 s) | barco-poster.webp | Hero: fondo de puerto | Logos menores de navieras |
| air | avion.mp4 | 1920×1080, 27.0 s | avion-720.mp4 (1280×720, 10 s, desde 8 s) | avion-poster.webp | Hero: ventana aérea; tracking aéreo | **Marca prominente (Cargolux)** |
| air_variant | avion1.mp4 | 1920×1080, 21.0 s | avion1-720.mp4 (10 s, desde 4 s) | avion1-poster.webp | Sin uso en UI | **Marca prominente (Delta)** |
| rail | tren.mp4 | 1920×1080, 11.2 s | tren-720.mp4 (11.2 s) | tren-poster.webp | Tracking ferroviario | Logos menores de navieras |
| road | camion.mp4 | 2160×3840 (9:16), 9.9 s | camion-720.mp4 (406×720, 9.8 s) | camion-poster.webp | Tracking terrestre | Ninguna visible |
| container_operations | contendores.mp4 | 3840×2160, 31.9 s | contendores-720.mp4 (12 s, desde 4 s) | contendores-poster.webp | Sin uso en UI todavía | Logos de grúa y contenedores |
| scan | escaneo.mp4 | 3840×2160, 8.7 s | escaneo-720.mp4 (8.7 s) | escaneo-poster.webp | Problema: registro de hito | Ninguna visible |
| workers | personal.mp4 | 2560×1440, 18.3 s | personal-720.mp4 (12 s) | personal-poster.webp | Implementación: personal de bodega | Ninguna visible |

## Notas

- Todos los derivados validados: H.264 yuv420p, sin pista de audio, faststart.
- Los archivos `avion` y `tren` contienen además una pista de datos de cámara (no es audio); no afecta a la reproducción.
- **Licencia y autoría:** no aprobadas. Antes de publicar hay que registrar autor, página de licencia y revisar releases de personas y marcas (ver `public/media/cinematic/license-manifest.json`).
- **Publicación:** los masters están dentro de `public/` y se servirían tal cual. Recomendado moverlos a `assets/media-sources/` (fuera del bundle) antes de desplegar. No se movieron en este corte para no alterar los archivos del usuario sin confirmación.
