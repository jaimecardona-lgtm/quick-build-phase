# Auditoría de medios cinematográficos · Sprint corrector

Fecha: 31-10-2026. Rama `primera-version`. Medición de dimensiones con Chromium sobre los binarios reales en `public/`.

## Conclusión

**No existe en el repositorio ningún video cinematográfico aprobado.** Tampoco hay un plato de tablet ni un render de dispositivo.

Lo que sí existe:
- Capturas reales del producto (`public/assets/01…08`): aprobadas para uso en el sitio.
- Fotografía de puerto (`logixtic-port-hero.webp`): útil como plato de capítulo, **procedencia y licencia no documentadas**.
- Globo de red (`closing-globe-v2.webp`): gráfico de 680×388 px, **resolución baja**; solo sirve en un marco pequeño.
- Render de centro de control (`logixtic-control-center.png`): **generado por IA o render, no es captura de Logixtic**, sin texto; uso solo como atmósfera tras confirmar derechos.

Por tanto, el criterio de calidad cinematográfica **no está cumplido**. Ver el bloqueo en la última sección.

## Inventario de medios (dimensiones medidas)

| Archivo | Dimensiones | Tamaño | Uso previsto | Estado local | Dueño / licencia |
| --- | --- | ---: | --- | --- | --- |
| `public/assets/01-plataforma-servicios-menu.webp` | 1836×857 | 747 KB | Captura real del producto: menú de servicios (Hero original, plato de tablet) | Presente | Captura de Logixtic; confirmar titularidad |
| `public/assets/04-seguimiento-operativo-pasos.webp` | 1885×834 | 583 KB | Captura real: seguimiento por pasos (Flow) | Presente | Igual que arriba |
| `public/assets/06-costos-operacion.webp` | 1836×856 | 589 KB | Captura real: costos (Flow, Hero H4 alterno) | Presente | Igual que arriba |
| `public/assets/07-rentabilidad-margen.webp` | 1600×732 | 67 KB | Captura real: margen (Flow, Hero H4 alterno) | Presente | Igual que arriba |
| `public/assets/02, 03, 05, 08` | 1600–1795 px ancho | 111–689 KB | Captura real (Flow) | Presente | Igual que arriba |
| `public/assets/logixtic-logo-negativo-transparente.png` | 1520×465 | 44 KB | Logo | Presente | Marca propia |
| `public/__l5e/.../logixtic-port-hero.webp` | 1672×941 | 152 KB | Plato del capítulo A del hero (puerto nocturno) | **Restaurado** desde la app publicada | Subido al proyecto de Lovable; **procedencia no documentada** (parece imagen generada o de stock) |
| `public/__l5e/.../closing-globe-v2.webp` | 680×388 | 26 KB | Globo de red (capítulo B) | Restaurado | Subido al proyecto; resolución baja |
| `public/__l5e/.../logixtic-control-center.png` | 1672×941 | 1.9 MB | Atmósfera de centro de control (no usado en código) | Restaurado | Render; **no es captura de producto** |
| `public/__l5e/.../hero-platform.webp` | 1402×1122 | 152 KB | Ilustración del Hero original | Restaurado | Subido al proyecto |
| `public/__l5e/.../logixtic-closing-official.png` | 1920×610 | 52 KB | Logo de cierre (Closing) | Restaurado | Logo oficial |
| `public/__l5e/.../logix1.jpeg`, `cost-analysis.jpg`, `shipment-profitability.webp`, `transport-quotes.webp`, `team-collaboration.jpg`, `fragmented-paperwork.jpg`, `disconnected-documents.webp` | 1024–1600 px | 110–310 KB | Ilustraciones de retos y casos (algunas sin uso actual en código) | Restaurados | Subidos al proyecto; procedencia no documentada |
| Logos de clientes (`rr-logistics`, `connecta-global-logistics`, `global-freight`, `transinternational-cargo`, `trade-business-sas`, `navis`, `clm-cargo`, `swift-cargo`, `sc-itrading`, `logistics-solutions`, `transmares-usa`, `grupo-bsp`) | 576–1575 px | 52–645 KB | Logos de clientes (ClientsReel / Evidence) | Restaurados | Logos de clientes; permiso de uso del cliente por confirmar |
| Sellos (`basc`, `oea`, `oea-colombia`, `iso`, `iso-28000-seal`, `paperless`, `zerowaste`) | 120–1254 px | 10 KB–1.5 MB | Badges de cumplimiento (Footer) | Restaurados | Sellos de terceros: confirmar autorización de uso |

**Incidencia 404 de `__l5e/assets-v1`:** resuelta en local copiando los 36 binarios publicados a `public/__l5e/...` con verificación de tamaño. El código no cambió. No se inventó ningún logo.

**Hallazgo:** varios assets restaurados no tienen referencias en `src/` (`logixtic-port-hero`, `closing-globe`, `logix1`, `logixtic-control-center`, `cost-analysis`, `shipment-profitability`, `transport-quotes`). Se usarán en el hero cinematográfico solo como planos; el resto queda como material disponible.

## Medios cinematográficos requeridos (ruta propuesta)

Ninguno de estos archivos existe. Ver `public/media/cinematic/license-manifest.json`.

| Ruta propuesta | Estado | Bloqueo |
| --- | --- | --- |
| `public/media/cinematic/hero-port-1080.mp4` | **Ausente** | Footage de puerto con cámara ascendente real. Requiere producción o licencia |
| `public/media/cinematic/hero-port-720.mp4` | **Ausente** | Derivado de lo anterior |
| `public/media/cinematic/hero-port-poster.webp` | **Ausente** | Puede generarse de un fotograma aprobado |
| `public/media/cinematic/cargo-air-1080.mp4` | **Ausente** | Footage aéreo real. Opcional: si no existe, la escena C se omite |
| `public/media/cinematic/cargo-air-poster.webp` | **Ausente** | — |
| `public/media/cinematic/global-network-720.mp4` | **Ausente** | Globo de red en video |
| `public/media/cinematic/global-network-poster.webp` | **Ausente** | Puede usar `closing-globe-v2.webp` como poster provisional |
| `public/media/cinematic/tablet-plate.webp` | **Ausente** | Plato de tablet con pantalla vacía para compositar la captura real |

## Recomendaciones de procesamiento (cuando exista el material aprobado)

- Master fuera del bundle. Derivados H.264 silencioso, `yuv420p`, `+faststart`, 24 fps.
- Derivado de scrub: GOP corto (4–8 cuadros). Validar con `ffprobe` (duración, codec, densidad de keyframes).
- 1080p y 720p (móvil). Posters WebP. No cargar video al inicio.
- Verificar el seek en navegadores reales, no solo con pruebas unitarias.

## Fuentes de referencia

Los sitios de referencia (Freight Scroll Hero, Halden, Sellix, Norva, OceanPulse, Cargox) se usan solo como análisis de técnica. No se descargó ni se publicó ningún medio suyo.
