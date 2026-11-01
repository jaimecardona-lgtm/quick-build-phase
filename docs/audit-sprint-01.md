# Auditoría de la aplicación actual · Sprint 01

Base: commit `f4b1d03` en `primera-version` (idéntico a `main`). Fecha de corte: 31-10-2026.

## Stack verificado

| Área | Hallazgo | Archivo |
| --- | --- | --- |
| Framework | TanStack Start + Router, React 19, TypeScript, Vite 8, Tailwind 4 | `package.json`, `vite.config.ts` |
| Build | Nitro con preset `cloudflare-module` (la salida es un Worker, no un servidor Node) | `.output/nitro.json` (generado) |
| Gestor | `bun.lock` (bun 1.3.x); el README indica `npm` | `bun.lock`, `README.md` |
| Config Lovable | Plugin gestionado por `@lovable.dev/vite-tanstack-config`; no añadir plugins duplicados | `vite.config.ts` |
| Rutas | `/` y `/planeacion`; `routeTree.gen.ts` es generado | `src/routes/index.tsx`, `src/routes/planeacion.tsx`, `src/routeTree.gen.ts` |
| Estilos | Hoja global de 1.259 líneas con tokens en `@theme inline` | `src/styles.css` |
| Idiomas | ES en `content.ts` y `i18n.tsx`; EN y PT-BR en `i18n.tsx` y `operational-challenges.ts` | `src/lib/*.ts(x)` |
| Selector | Persistencia en `localStorage` (`logixtic-language`) | `src/lib/i18n.tsx` |

## Home (orden de secciones)

Ver el mapa completo en [content-baseline.md](./content-baseline.md#mapa-de-secciones-del-home). Resumen:

`Header` → `Hero` → `ClientsReel` → `OperationalChallenges` → `Problem` → `SuccessStories` → `Flow` → `LogixAI` → `Evidence` → `Implementation` → `Plans` → `Faq` → `Closing` → `Footer` → `WhatsAppFloat`.

## Conversión y enlaces externos

| Elemento | Destino | Archivo |
| --- | --- | --- |
| CTA demo | HubSpot `meetings.hubspot.com/carlossalazar/diagnostico` | `src/lib/logixtic.ts`, `src/hooks/use-demo-url.ts` |
| CTA principal Hero | WhatsApp (`wa.me/573189733174`) | `src/lib/whatsapp.ts` |
| Diagnóstico ROI | Sitio externo `diagnosticoroilogixtic.lovable.app` (no hay calculadora en el repo) | `src/lib/i18n.tsx` |
| Blog | Sitio externo `logixtic.co/blog-logixtic/` | `src/lib/content.ts`, `src/lib/i18n.tsx` |
| Analytics | `window.dataLayer` con eventos `demo_cta_click` y `secondary_cta_click` | `src/lib/analytics.ts` |

## SEO

Título, descripción, Open Graph, Twitter card, canonical y tres bloques JSON-LD (`Organization`, `SoftwareApplication`, `FAQPage`) en `src/routes/index.tsx`. `/planeacion` tiene `robots: noindex`.

## Assets

- Capturas oficiales: `public/assets/01…08-*.webp` (8 archivos).
- Logo: `public/assets/logixtic-logo-negativo-transparente.png` y `src/assets/logix-transparent.png.asset.json`.
- Imágenes y sellos importados: `src/assets/*.asset.json` (Lovable).
- **Hallazgo:** los `.asset.json` apuntan a rutas `__l5e/assets-v1/...` que solo resuelven dentro de Lovable. En desarrollo local dan 404 (hero, logos de clientes). No afecta a producción dentro de Lovable, pero impide verificar esas imágenes en local.

## Animaciones existentes

- Hero: flotación de la imagen y destellos (`hero-image-float`, `hero-sparkle`), revelado de texto (`logixtic-rise`), pausa con `data-active` por IntersectionObserver.
- `useReveal` (`src/hooks/use-reveal.ts`): revela `[data-reveal]` una sola vez.
- Carrusel de logos (`clients-reel-track`), animaciones de Flow, conteo en Evidence (`CountUp`) y estados de LogixAI.
- `styles.css` contiene varias reglas `prefers-reduced-motion` (Hero, ClientsReel, Flow, Implementation, entre otras). No se verificó una a una que cubran todas las animaciones.

## Hallazgos

| Severidad | Hallazgo | Acción en el sprint |
| --- | --- | --- |
| Alta | `/planeacion` sin control de acceso; estado completo en `localStorage` | Documentado en SEC-01. Ruta conservada |
| Alta | El agente "Logix" es una simulación con respuestas fijas; no hay OpenRouter | Documentado en SEC-03. No se presenta como capacidad real |
| Media | El ROI es un enlace externo, no un motor interno | Documentado; Fase 3 |
| Media | `/planeacion` muestra "Integratech" en título y descripción | Sin cambio; es contenido, fuera del alcance |
| Baja | El checkout de Windows usa CRLF (`core.autocrlf=true`); Prettier marca `Hero.tsx` y otros archivos existentes | Previo al sprint; no corregido |
| Baja | `lint` reporta errores de formato en archivos existentes del home | Previo al sprint; no corregido |

## Verificación del baseline

- `bun run verify:content`: 1.291 cadenas en 49 bloques, sin diferencias.
- Prueba negativa: alterar "Conoce la plataforma" falla la verificación; al restaurar, pasa.
