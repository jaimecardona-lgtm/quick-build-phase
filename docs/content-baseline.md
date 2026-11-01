# Baseline de contenido comercial

Estado de referencia del copy de la home de Logixtic antes del sprint 01 (commit base `f4b1d03`, rama `primera-version`).

## Regla

El copy comercial ES / EN / PT-BR **no se modifica** en este sprint: títulos, descripciones, CTAs, FAQ, planes, cifras, testimonios, links, textos `alt` y `aria-label`. Cualquier cambio de copy requiere aprobación del equipo comercial y regenerar el baseline en el mismo commit.

## Prueba automática

```powershell
bun run verify:content          # compara con scripts/content-baseline.json
node scripts/verify-content-preservation.mjs --write   # solo tras aprobación de copy
```

- `scripts/verify-content-preservation.mjs` recorre con el compilador de TypeScript `src/lib/content.ts`, `src/lib/i18n.tsx`, `src/lib/operational-challenges.ts`, `src/lib/whatsapp.ts` y `src/components/site/*.tsx`.
- Extrae cadenas literales, texto JSX y atributos `alt`, `title`, `aria-label` y `placeholder`. Excluye clases CSS (`cn`, `cva`), nombres de evento (`track`), URLs y rutas.
- Cada cadena se agrupa por bloque de nivel superior (`es`, `en`, `pt`, nombre del componente), lo que separa los tres idiomas del diccionario de `i18n.tsx`.
- Comparación por multiconjunto: cualquier cadena añadida o eliminada falla la prueba.
- Verificado: al alterar una palabra de `content.ts#hero` la prueba falla con exit code 1; al restaurar, pasa.

Estado actual: **1.291 cadenas en 49 bloques**, sin diferencias.

Distribución relevante:

| Fuente | Bloque | Cadenas |
| --- | --- | ---: |
| `src/lib/content.ts` | hero, problem, flow, logix, portal, evidence, implementation, faqs, closing | 9 + 13 + 25 + 12 + 9 + 15 + 14 + 30 + 3 |
| `src/lib/i18n.tsx` | `es` / `en` / `pt` (diccionarios locales) | 44 / 199 / 200 |
| `src/lib/operational-challenges.ts` | `operationalChallenges` (ES / EN / PT-BR) | 24 |
| `src/components/site/*.tsx` | copy local por componente (LogixAI, Plans, Implementation, Evidence, Footer...) | ver baseline |

Nota: el bloque `es` de `i18n.tsx` contiene solo las etiquetas de UI en español (44); el copy comercial en español vive en `content.ts`. Por eso `es` tiene menos cadenas que `en` y `pt`, que duplican el copy completo.

## Invariantes

1. Los textos ES de `content.ts` son la fuente del idioma `es`; `i18n.tsx` solo los referencia.
2. EN y PT-BR se mantienen en `i18n.tsx` y `operational-challenges.ts`.
3. Los links externos son los siguientes y no cambian:
   - Blog: `https://logixtic.co/blog-logixtic/` (`content.ts`, `i18n.tsx`).
   - Diagnóstico ROI: `https://diagnosticoroilogixtic.lovable.app` (`i18n.tsx`, `diagnosticLink`). Es un sitio externo; no hay calculadora en este repositorio.
   - Agenda demo: `https://meetings.hubspot.com/carlossalazar/diagnostico` (`src/lib/logixtic.ts`, `DEMO_BASE_URL`).
   - WhatsApp: `https://wa.me/573189733174?...` (`src/lib/whatsapp.ts`).
   - Logos y video de casos: ver `src/components/site/SuccessStories.tsx` y `ClientsReel.tsx`.
4. Conversiones existentes: HubSpot (`src/lib/logixtic.ts`), WhatsApp (`whatsappCopy`, `WhatsAppFloat`), `dataLayer` de Google (`src/lib/analytics.ts`) con eventos `demo_cta_click` y `secondary_cta_click`.
5. Assets oficiales: capturas en `public/assets/01…08` y logo en `public/assets/logixtic-logo-negativo-transparente.png`; activos importados en `src/assets/*`. No se reemplazan.
6. Hero actual (`src/components/site/Hero.tsx`) consume `content.hero` y su CTA `DemoButton` + enlace `#plataforma`. El nuevo Hero reutiliza esos mismos datos.

## Metadatos SEO (`src/routes/index.tsx`)

- `title`: "Logixtic® | Software para Agentes de Carga Internacional".
- `description` y `og:*` / `twitter:card` (summary_large_image).
- `canonical`: `https://www.logixtic.co/`.
- JSON-LD: `Organization`, `SoftwareApplication`, `FAQPage` (generado desde `faqs`).
- Preload de `/assets/01-plataforma-servicios-menu.webp`.

No cambian en este sprint.

## Mapa de secciones del home

Orden de `src/routes/index.tsx`:

1. `Header` (navegación: Plataforma, Logix, Clientes, Implementación; selector de idioma).
2. `Hero` (`#inicio`): copy a la izquierda, ilustración a la derecha. **Único módulo transformado en el sprint.**
3. `ClientsReel` (`#clientes`): carrusel de logos de clientes.
4. `OperationalChallenges`: retos operativos con imágenes.
5. `Problem`: fuentes dispersas de información.
6. `SuccessStories`: video de cliente.
7. `Flow` (`#plataforma`): recorrido por etapas con capturas reales.
8. `LogixAI` (`#logix-ai`): copilotos y respuestas **demostrativas estáticas**; no hay integración con IA.
9. `Evidence`: métricas y casos de éxito.
10. `Implementation` (`#implementacion`): seis etapas.
11. `Plans`: planes.
12. `Faq`: preguntas frecuentes.
13. `Closing`: cierre y CTA.
14. `Footer`: badges de cumplimiento (BASC, OEA, ISO 28000, ISO, paperless, zero waste), enlaces legales.
15. `WhatsAppFloat`: botón flotante.

## Registro de hechos

- El ROI es un link externo (`diagnosticoroilogixtic.lovable.app`). No existe calculadora interna.
- El agente de IA (`LogixAI.tsx`) es una simulación: respuestas fijas. No hay llamadas a OpenRouter ni a ningún modelo.
- `/planeacion` no tiene control de acceso; ver [security-backlog.md](./security-backlog.md).
