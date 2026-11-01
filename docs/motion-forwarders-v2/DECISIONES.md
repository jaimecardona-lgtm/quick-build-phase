# Motion Forwarders V2 — decisiones y estado

Rama: `segunda-version`. Sin commit, push, merge ni deploy. `primera-version` y `main` no se tocan.
Variante: `vite dev --mode forwarders-v2` en `localhost:8082` (`.env.forwarders-v2`, `VITE_LOGIXTIC_VARIANT=forwarders-v2`).
Base de comparación: `localhost:8081` (sin ese modo). Mismo código; la variante se activa solo con el modo (`FORWARDERS_V2` en `src/lib/cinematic-assets.ts`).

## Inspección de recursos (física, no inferida)

Fotogramas extraídos a 4 s de cada master y revisados en un mosaico. Derechos: ninguno verificado.

| Archivo | Dimensiones / duración | Contenido visible | Personas | Marcas visibles | Uso en V2 |
|---|---|---|---|---|---|
| barco.mp4 | 3840x2160, 18.4 s | Buque, grúas portuarias | No | Logo pequeño en buque (no verificado) | Hero (exclusivo) |
| contendores.mp4 | 3840x2160, 31.8 s | Terminal, grúa azul, contenedores | No | Navieras (ONE, MSC) en contenedores | Flow (exclusivo) |
| tren.mp4 | 1920x1080, 11.2 s | Tren de contenedores, catenaria | No | MSC en vagones | Trazabilidad multimodal (exclusivo) |
| avion1.mp4 | 1920x1080, 21.0 s | Avión en plataforma, carga | Sí (operario al fondo) | **Delta** | No usado |
| avion.mp4 | 1920x1080, 27.0 s | Pista y hangares | No | No legible | No usado (derechos pendientes) |
| camion.mp4 | 2160x3840 (vertical), 9.8 s | Camión en carretera | Conductor en cabina | Nissan Diesel | No usado (vertical) |
| escaneo.mp4 | 3840x2160, 8.7 s | Persona de cerca, envoltura | Sí | No | Excluido (personas) |
| personal.mp4 | 2560x1440, 18.3 s | Operario con cajas | Sí | No | Excluido (personas) |
| contenedores.jpg | 2048x1293 | Vista aérea de contenedores azules, sin personas | No | No | Problema (imagen) |
| digitalizacion.jpg | 1408x768 | Sala con dashboards y mapas generados | No | No (interfaz genérica inventada) | Flow, capa conceptual DEMO |
| aplicacion web.jpg | 1536x1024 | Portátil con dashboard "VELOCITY" (ficticio) y camiones | No | "VELOCITY" (marca ajena) | Planes, fondo conceptual DEMO |

Captura real del producto: `public/assets/01-plataforma-servicios-menu.webp` (módulo Servicios, datos demo). Usada en el hero V2.

## Exclusividad de videos

- Manifiesto: `src/lib/visual-scenes.ts` (`masterId`, `sectionId`, `kind`, `purpose`, `representation`).
- Verificación automática: `node scripts/verify-video-exclusivity.mjs` (falla si un masterId está en más de una sección o si falta el master o el derivado 720p). Control negativo comprobado: barco en Flow → exit 1.
- Verificación en DOM (8082): `barco-720.mp4` solo en `inicio`, `tren-720.mp4` solo en la sección de trazabilidad, `contendores-720.mp4` solo en `plataforma`. Los tres avanzan `currentTime`.
- Videos con personas no se usan en V2. Sin permiso verificado de avion, avion1 ni camion.
- Limitación: la variante 8081 (base) sigue usando barco y tren en varias secciones. No se modificó para no alterar 8081.

## Matriz por sección (V2, 8082)

| Sección | Visitante | Mensaje | Evidencia de producto | Medio V2 | Efecto | CTA | Riesgo de confusión | Archivos | Estado |
|---|---|---|---|---|---|---|---|---|---|
| Hero | Freight forwarder | Control y visibilidad con el sistema operativo (copy actual) | Captura real del módulo Servicios, en perspectiva | barco.mp4 + capa de rutas SVG | Entrada del plano y rutas animadas; sin pin | Sin cambio | Captura en blanco sobre el puerto: teñida, sin texto nuevo | CinematicHero.tsx, cinematic.css, DataNetworkLayer.tsx | IMPLEMENTADO (desktop ≥1024; móvil sin composición) |
| Clientes | Freight forwarder | Ecosistema de agentes (logos sin cambio) | — | Capa SVG de red | Nodos y enlaces con pulso | Sin cambio | Bajo: logos sobre fondo sin video | ClientsReel.tsx | PARCIAL: sutil |
| Desafíos operativos | Freight forwarder | Información dispersa limita el control | — | Capa SVG de dispersión que converge en un centro | Enlaces que convergen | Sin cambio | Bajo | OperationalChallenges.tsx | PARCIAL: sutil, poco protagonismo |
| Problema | Freight forwarder | Complejidad operativa (copy actual) | contenedores.jpg | Imagen fotográfica con velo azul noche | Estática | Sin cambio | Bajo: sin personas | Problem.tsx, SceneStill.tsx | IMPLEMENTADO |
| Casos | Freight forwarder | Resultados de clientes (testimonio sin cambio) | — | Capa SVG de red | Pulso | Sin cambio | Bajo | SuccessStories.tsx | PARCIAL: sutil |
| Flujo | Freight forwarder | Operación física → registro → control | contendores.mp4 + digitalizacion.jpg (DEMO) + trazas DEMO existentes | Video exclusivo y capa conceptual superpuesta | Imagen superpuesta en el lado derecho con máscara | Sin cambio | Media: la capa conceptual se rotula DEMO | Flow.tsx, scene-stills.css | IMPLEMENTADO (parcial en secuencia causal: sin nueva animación por etapas) |
| Logix | Freight forwarder | Copiloto (avatar y demo sin cambio) | — | Capa de datos existente (LogixDataLayer) | Igual que 8081 | Sin cambio | Demo LogixAI ≠ widget público | LogixAI.tsx | NO CAMBIÓ en V2 |
| Evidencia | Freight forwarder | Presencia regional (mapa y métricas sin cambio) | — | Capa SVG de rutas | Arcos animados | Sin cambio | Bajo: el mapa sigue al frente | Evidence.tsx | PARCIAL: sutil |
| Implementación | Freight forwarder | Puesta en marcha (copy actual) | — | Capa SVG de rieles con paradas | Paradas que pulsan | Sin cambio | Bajo: sin personas | Implementation.tsx | PARCIAL: sutil |
| Planes | Freight forwarder | Escalabilidad (copy actual) | — (aplicacion web.jpg retirado: muestra "VELOCITY") | Capa SVG de red | Pulso | Sin cambio | Bajo | Plans.tsx | PARCIAL: sutil |
| FAQ | Freight forwarder | Preguntas (copy sin cambio) | — | Capa SVG de red | Pulso | Sin cambio | Bajo | Faq.tsx | PARCIAL: sutil |
| Cierre | Freight forwarder | Invitación a demo (copy sin cambio) | — | Capa SVG de red | Pulso | Sin cambio | Bajo | Closing.tsx | PARCIAL: sutil |
| Tracking multimodal | Freight forwarder | Trazabilidad multimodal (tarjetas DEMO sin cambio) | tren.mp4 | Video exclusivo | Loop | Sin cambio | Bajo | MultimodalTracking.tsx | IMPLEMENTADO |

## Reglas de implementación aplicadas

- No hay pin ni contenedores de 300vh en V2 (el hero se mueve con el scroll normal).
- Las capas SVG tienen geometría fija (sin aleatorio) para que SSR e hidratación coincidan.
- Movimiento con transform/opacity y dash; `prefers-reduced-motion` desactiva las animaciones.
- Las reglas globales `:not(.bgseq)` excluyen `.dn-layer`, así ninguna capa toma z-index 3.
- Copy: `verify:content` 1284/1284 sin cambios. No se regeneró el baseline.
- Sin cifras nuevas de ventas, ROI, Gartner ni costos.

## Pendientes y bloqueos reales

- **Derechos:** barco, contendores y tren no tienen permiso comercial verificado. avion y avion1 muestran marcas (Delta). camion es vertical. Carlos/Angela deben aportar originales y licencias.
- **Personas:** personal.mp4 y escaneo.mp4 excluidos de V2 hasta aprobación.
- **aplicacion web.jpg:** la interfaz "VELOCITY" es ajena a Logixtic. Está rotulada DEMO, pero conviene reemplazarla por una composición propia antes de publicar.
- **Logix y Testimonio:** Logix no cambió en V2. El testimonio de YouTube no se verificó en navegador real.
- **Copy candidato:** H1, subtítulo, eyebrow, CTA y aclaración no se aplicaron; requieren aprobación editorial en ES/EN/PT-BR.
- **Pruebas pendientes:** no se hicieron pruebas con 5 usuarios objetivo, Lighthouse ni medición en red lenta.
- **Procesos:** en 8081 hay dos instancias de Vite (una del 31/10 y otra del 1/11). No se detuvieron porque no las inicié yo.

## Hotfix de composición (Logix y flujo)

- **Causa verificada en DOM:** `.home-cinematic .amb > :not(...)` y `.bgseq-host > :not(...)` (especificidad 0,4,0) aplicaban `position: relative; z-index: 3` a `.lx-data-layer`, que quedaba en el flujo y ocupaba 900 px. Resultado: sección de 1549 px, copy fuera del pliegue y `data-reveal` sin `data-visible`.
- **Corrección:** los selectores genéricos excluyen `.bgseq`, `.scene-still`, `.dn-layer` y `.lx-data-layer`. La capa de Logix queda `position: absolute; z-index: -1` (sección de 649 px en desktop).
- **Selector incorrecto:** `.home-cinematic main > section` nunca coincidía, porque `.home-cinematic` es el propio `main`. Corregido a `main.home-cinematic > section`.
- **Verificación:** `getBoundingClientRect` y `getComputedStyle` en 8081 y 8082 a 1440 y 390. Las 21 `[data-reveal]` tienen `data-visible="true"` tras recorrer toda la página. Ninguna capa decorativa queda en flujo. Sin errores de consola.
- **Alcance:** el hotfix es CSS compartido, así que también afecta a 8081 (la base). Solo corrige la composición.
- **Flow:** secuencia `OPERACIÓN → INFORMACIÓN → SISTEMA → CONTROL` con cuatro iconos y trazo animado (`FlowTransform.tsx`). Sin etiquetas de texto: el copy nuevo requiere aprobación.
- **Pendiente:** LogixAI mantiene su composición original y su capa de datos; no se añadieron conexiones nuevas entre personaje, consultas y módulos.

- **Retirado:** `aplicacion web.jpg` sale de V2 por instrucción expresa de no presentar VELOCITY (interfaz ajena) como producto. Planes usa la capa de red.

## Ajuste de dirección visual (V13)

- **Hero:** solo `public/media/img/digitalizacion.jpg` (sin video encima). Captura real del módulo Servicios a la derecha. Rotulado "Ilustrativo · DEMO" por ser conceptual. Copy aprobado sin cambios. Verificado en DOM: 0 videos en el hero, imagen cargada, H1 intacto (1440 y 390).
- **Video de barco:** eliminado del manifiesto y del hero (no se usa como hero).
- **`aplicacion web.jpg`:** en Dolor operativo (`operational-challenges`) como recorte de camiones y puerto. Sin la interfaz VELOCITY (el recorte parte del borde izquierdo y escala 2.6x). Las tarjetas existentes se ven como vidrio (CSS, sin cambio de copy).
- **Por qué elegirnos:** sección nueva solo en V2 (`WhyChooseUs.tsx`), después de Logix. Cinco tarjetas con icono y conectores. **Copy candidato** (`why-choose-labels.ts`): requiere aprobación editorial y verificar cada capacidad en el producto antes de publicarse. Referencia visual: "Por que elegirnos - Logixtic.jfif.jpeg" (no incrustada, no copiar su texto ni URL).
- **Globo (Evidencia):** órbitas SVG de avión, barco y camión alrededor del globo. Sin videos: `escaneo.mp4` muestra a una persona; `avion1.mp4` muestra la marca Delta; `avion.mp4` no tiene derechos verificados.
- **Videos en V2:** 2 (`tren` en trazabilidad y `contendores` en Flow). Exclusivos según el manifiesto y verificados en DOM.
- **Imágenes de carrusel:** no incrustadas (contienen cifras y claims sin fuente: 500 h/mes, 65 % Gartner). Solo referencia visual.
- **Descartado:** `barco-720.mp4` como hero; `escaneo.mp4`; `avion1.mp4`; `camion.mp4` (vertical); `digitalizacion.jpg` en Flow (ahora solo en hero).
- **Pendiente:** LogixAI no recibió conexiones nuevas en esta ronda. Las cinco capacidades y sus textos requieren aprobación.

## Ajuste de fondos, imágenes y videos (V14)

| Sección | Medio | Referencia del jefe | Intención visual |
|---|---|---|---|
| Hero | digitalizacion.jpg (estática, DEMO) + captura real | — | Sistema operativo digital |
| Dolor operativo | captura real del producto en plano con perspectiva (01-plataforma-servicios-menu.webp) + 3 tarjetas existentes | logixtic_diseno_operativo | Tareas manuales frente a control |
| Problema | contenedores.jpg | logixtic_carrusel_2 | Complejidad antes de centralizar |
| Flow | contendores-720.mp4 | — | Operación física → registro digital |
| Por qué elegirnos | escaneo-720.mp4 (fondo, velo fuerte) + 5 tarjetas de vidrio | Por que elegirnos | Control documental y capacidades |
| Presencia regional / globo | avion1-720.mp4 detrás del mapa + órbitas SVG (avión, barco, camión) | logixtic_carrusel_3 | Visibilidad y conectividad global |
| Implementación | personal-720.mp4 (aviso de actores de stock) | logixtic_carrusel_4 | Acompañamiento y capacitación |
| Planes | capa de rieles (escalado) | logixtic_carrusel_5 | Crecimiento por etapas |
| Tracking multimodal | tren-720.mp4 | — | Coordinación multimodal |

**aplicacion web.jpg:** sale de Dolor operativo (CAMBIO 1). **No se reubicó** en una sección con el PC protagonista: la pantalla del portátil muestra la interfaz "VELOCITY", que no es Logixtic. Pendiente de decisión (ver abajo).

**Videos exclusivos:** tren, contendores, avion1, personal, escaneo (cinco masterId en cinco secciones distintas). Verificado con `scripts/verify-video-exclusivity.mjs` y en DOM.

**Riesgos abiertos:**
- avion1: la marca Delta es visible en el fotograma. Derechos sin verificar. No se presenta como socio.
- personal y escaneo: muestran personas. El uso en estas secciones lo autoriza el encargo, pero la procedencia (si son actores de stock) no está verificada; se mantiene el aviso de stock.
- aplicacion web.jpg: pendiente de decisión.
