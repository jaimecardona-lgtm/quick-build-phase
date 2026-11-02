# 07 — Diagnóstico de OpenRouter, estrategia de modelos y publicación controlada

Estado: **código listo y probado con mocks. No se ha publicado (sin commit, push ni deploy).**

## 1. Diagnóstico de OpenRouter (verificado)

Consulta oficial `GET /api/v1/key` (una sola vez, sin exponer la clave):

| Medida | Valor |
|---|---|
| Cuenta gratuita | sí |
| Saldo y gasto | 0 USD gastados de 1000 USD de límite |
| Peticiones a modelos gratuitos (día) | **24 usadas de 50** (26 restantes) |

**Conclusión:** los 429 **no** son la cuota diaria de la cuenta. Son límites temporales del **proveedor** de cada
modelo (Google para Gemma; el proveedor de Liquid). Lo confirman los códigos HTTP observados:

| Modelo | Respuesta observada | Causa |
|---|---|---|
| `google/gemma-4-26b-a4b-it:free` (primario) | 429 | Límite del proveedor Google en ese momento |
| `google/gemma-4-31b-it:free` | 429 | Límite del proveedor Google |
| `liquid/lfm-2.5-2.6b:free` (fallback) | 400 `Reasoning is mandatory for this endpoint and cannot be disabled.` | El endpoint exige razonamiento; `effort: none` se rechaza |
| `liquid/lfm-2.5-2.6b:free` tras reintento con `effort: low` | 429 | Límite del proveedor en ese momento |
| `openrouter/free` (router) | 200 con `finish_reason: length` y sin texto | El router eligió `nvidia/nemotron-3.5-lightning:free`, un modelo que razona y consume todos los tokens |

Otros fallos posibles, descartados en esta sesión: timeout real (la latencia observada fue de 3 a 17 s, dentro del
total de 20 s), modelo no disponible (aparecen en el catálogo público), y clave inválida (las llamadas autenticadas
respondieron).

## 2. Cambios de código (con pruebas)

- **Control de razonamiento** `OPENROUTER_REASONING_EFFORT` (por defecto `none`, documentado por OpenRouter como
  parámetro `reasoning.effort`). `off` no lo envía.
- **Reintento único** con `effort: low` solo cuando el proveedor responde exactamente *"Reasoning is mandatory…"*.
  Otros 400 no se reintentan. Pruebas: reintento, no reintento y payload.
- **Fallback fijo, sin router** en la configuración recomendada.
- **Observabilidad sin texto:** `effective_model`, `fallback_used`, `primary_error_kind`, `degradation_reason`,
  `latency_ms`, `tokens`, `retrieval`, `embedding_status`, `rpc_status`, `finish_reason` y `has_reasoning` cuando
  el contenido viene vacío.
- **Degradación segura:** si toda la cadena falla, se devuelve la respuesta extractiva aprobada con sus fuentes.
- **Límite total de reloj** de 20 s (timeouts de `httpx` por intento y `asyncio.timeout` total).

## 3. Riesgos de cuota gratuita (declarados)

1. Los modelos `:free` no tienen SLA; el proveedor puede devolver 429 de forma temporal o sostenida.
2. El límite diario de la cuenta (50 peticiones gratuitas) es un techo real: 26 restantes hoy.
3. La cadena actual puede quedar sin modelo disponible; en ese caso el visitante recibe la respuesta extractiva
   aprobada, nunca una respuesta inventada.
4. **Recomendación pendiente de tu autorización:** un modelo de pago con límite propio como primario o fallback.
   No lo he activado (restricción de la fase).

## 4. Variables para Render (solo nombres y valores propuestos; no aplicadas)

| Variable | Valor propuesto | Notas |
|---|---|---|
| `AGENT_DRY_RUN` | `false` | Para llamadas reales |
| `OPENROUTER_API_KEY` | (privada) | Ya existe |
| `OPENROUTER_PRIMARY_MODEL` | `google/gemma-4-26b-a4b-it:free` | Sujeta a cuota del proveedor |
| `OPENROUTER_FALLBACK_MODEL` | `liquid/lfm-2.5-2.6b:free` | Requiere el reintento con `low` (ya implementado) |
| `OPENROUTER_REASONING_EFFORT` | `none` | Desactiva razonamiento cuando el modelo lo permite |
| `OPENROUTER_MAX_TOKENS` | `1024` | Evita truncamiento en modelos que razonan |
| `OPENROUTER_TIMEOUT_SECONDS` | `12` | Por intento |
| `AGENT_TOTAL_TIMEOUT_SECONDS` | `20` | Total del agente; el SSR espera 24 s |
| `RAG_ENABLED` | `true` | **Propuesto; no activado.** Requiere que el SSR apunte a Supabase |
| `SUPABASE_URL` | (privada) | Ya existe |
| `SUPABASE_SECRET_KEY` | (privada, `sb_secret_*`) | Solo servidor |
| `RAG_EMBEDDING_MODEL` | `nvidia/nemotron-3.5-embed-1b:free` | Mismo modelo que la ingesta |
| `RAG_EMBEDDING_DIMENSION` | `2048` | Fijada por la migración 0003 |
| `RAG_MIN_SIMILARITY` | `0.35` | Calibrado con cuatro consultas |
| `LEADS_ENABLED` | `false` | Sin cambios |
| `TAVILY_ENABLED` | `false` | Sin cambios |
| `TAVILY_EXTRACT_ENABLED` | `false` | Sin cambios |
| `INTERNAL_HMAC_SECRET` | (privada) | Mismo valor en SSR y API |
| `APP_ENV` | `staging` | Exige HMAC |

## 5. Seguridad (fase 4)

- **`.env` raíz:** fuente local correcta. Contiene las claves modernas (`sb_secret_*`, `sb_publishable_*`) y las
  de OpenRouter y Tavily.
- **`.env.supabase.local`:** **no lo lee ningún código ni configuración.** Contiene una clave `service_role` heredada
  (formato JWT). **Solicito autorización para eliminarlo.** No lo he borrado.
- **Build:** escaneados 127 artefactos de `.output/` y `dist/`: **0 coincidencias** con ninguna clave del `.env`.
- **Git:** ningún archivo `.env` con secretos está versionado. Los `.env.*` versionados (`.env.example`,
  `.env.development`, `.env.forwarders-v2`, `.env.container.example`, `backend/.env.example`) no contienen
  valores reales (el único patrón `sb_secret_…` es el marcador `EJEMPLO_NO_REAL`).
- **Navegador:** las variables `VITE_*` solo son banderas visuales y de funcionalidad.

## 6. Plan de publicación (cuando autorices)

1. Revisar este diagnóstico y decidir el modelo primario y fallback definitivos (gratuitos o de pago).
2. Confirmar la eliminación de `.env.supabase.local` (o mantenerlo).
3. Commit de las 29 entradas locales (12 modificadas, 17 nuevas) en `feat/productizacion-staging`.
4. Push normal (sin fuerza). No tocar `main`, `primera-version` ni `segunda-version`.
5. En Render: actualizar las variables de la tabla 4 **una a una**, empezando por las del agente, y dejar
   `RAG_ENABLED=false` hasta una prueba de chat exitosa con el modelo elegido.
6. Verificar en los logs de `agent_answer`: `effective_model` no vacío, `degradation_reason` vacío.
7. Activar `RAG_ENABLED=true` y repetir la prueba de la pregunta comercial.
8. Mantener `LEADS_ENABLED=false`, `TAVILY_ENABLED=false` y `TAVILY_EXTRACT_ENABLED=false`.

## 7. Estado de Git

Rama `feat/productizacion-staging`. Último commit `cba7bbb` (remoto). **29 entradas sin commit** (`git status`): 12 modificadas y
17 nuevas (`supabase/` cuenta como una entrada; contiene 3 migraciones y `config.toml`). `git diff --check` limpio. Ningún archivo de `src/` cambió en esta fase: Hero, videos, diseño, traducciones
y copy intactos (`verify:content`: 1284 cadenas).
