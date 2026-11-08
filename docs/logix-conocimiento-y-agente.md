# Logix: conversación real y conocimiento comercial público

Rama `feat/logixtic-staging-integration`. Cambios sin commit, sin push y sin deploy.

## Estado

| Frente | Estado |
|---|---|
| Fase A: conversación con historial, etiquetas honestas, pruebas | **Implementado y verificado sin red.** |
| Fase A: respuesta real de OpenRouter | **Bloqueado.** Falta `OPENROUTER_API_KEY` en el servidor, `OPENROUTER_PRIMARY_MODEL` está vacío y `AGENT_DRY_RUN=true`. |
| Fase B: corpus público versionado | **Implementado.** Pendiente de revisión del CCO. |
| Fase B: indexación en Supabase/pgvector | **No activada**, como pide el encargo. |

Para la prueba real: crear `backend/.env` a partir de `.env.example` con la clave y los modelos, poner `AGENT_DRY_RUN=false` solo en el servidor, y ejecutar `backend/scripts/check_openrouter.py --live`. Sin esos pasos, ninguna respuesta puede marcarse como «generada por IA».

## Fase A: qué cambió

- **Historial de sesión** (`src/components/experience/AgentWidget.tsx`, `src/lib/agent.functions.ts`): el navegador envía los últimos 6 turnos de la sesión, sin persistencia. El servidor los vuelve a validar: máximo 6, 600 caracteres por turno, solo roles `user` y `assistant`.
- **Orquestador** (`backend/app/services/agent_orchestrator.py`):
  - Saludos y cortesía van al modelo en modo conversacional. Si no hay modelo, se usa un texto programado y así se etiqueta.
  - Una pregunta sin fuente aprobada va al modelo en modo «sin contenido aprobado»: reconoce el límite y no inventa datos.
  - Seguimiento: primero se busca con la pregunta actual; si no hay coincidencias, se combina con el turno anterior.
  - El historial y el mensaje se envuelven como datos (`<<<…>>>`) y nunca tocan el mensaje de sistema. Los teléfonos y correos se redactan antes de enviarlos.
  - Las cifras o promesas sin respaldo se bloquean también en respuestas sin fuente.
- **Etiqueta de origen** (`answer_kind`, en `backend/app/api/v1/ai.py` y en el widget):
  - `model`: generada por OpenRouter.
  - `deterministic`: texto programado.
  - `extractive`: respaldo del contenido aprobado porque el juez bloqueó la respuesta.
  - `dry_run`: modo prueba.
  - `provider_failure`: el proveedor falló.
  - `refusal`: consulta sobre embarques reales, nunca enviada al modelo.
  - El indicador del widget ya no depende solo de `AGENT_DRY_RUN`.
- **Verificación del proveedor**: `backend/scripts/check_openrouter.py` muestra la configuración sin valores secretos. Con `--live` hace una sola llamada de prueba y no imprime el cuerpo de la respuesta.

## Fase B: clasificación del conocimiento

El ZIP está en `C:\Users\maura\Downloads\documentos logixtic\logixtic-skills.zip`. Su contenido ya está extraído, sin seguimiento en git, en `backend/app/logixtic-skills/`. No está en `public/`. Solo se incluye en la imagen de build de la etapa de pip, no en la de ejecución.

| Material | Clasificación | Uso |
|---|---|---|
| `logixtic-core/SKILL.md` | Interno (reglas de cumplimiento y jerarquía de fuentes) | No se publica; de él salen las reglas de redacción |
| `references/01-fuentes-y-discrepancias.md` | Interno | No se publica |
| `references/02-playbook-esencial.md` | Mixto | Solo lo de nivel A: propuesta de valor, problemas, módulos, COI, implementación |
| `references/03-claims-y-cumplimiento.md` | Interno | Solo sus redacciones aprobadas |
| `references/04-motor-conversacional.md` | Interno (guiones de venta, SETEO) | No se publica |
| `references/05-calibracion-transcripciones.md` | Confidencial (transcripciones de clientes) | No se publica |
| Los 6 Skills comerciales | Interno y reservado a usuarios comerciales | No se publican |

Honestidad sobre la lectura: leí `SKILL.md` del núcleo, `01`, `02` y `03`, y el README. No leí línea a línea `04`, `05` ni los seis Skills; los clasifiqué por su función declarada. Si se quiere una auditoría completa, falta esa lectura.

### Corpus público

`backend/app/knowledge/public_corpus_es.json`, versión `2026-11-08.1`, 26 entradas en español. Cada entrada tiene `source`, `approved_basis`, `scope: public` y `approval: approved`.

- Incluye: propuesta de valor, problemas que resuelve, módulos, portal del cliente, margen, documentos, idiomas, trabajo manual, Diagnóstico, COI, escenarios de retorno con 20/40/60 % rotulados como no garantía, implementación sin plazos, integraciones «por confirmar», certificaciones con la redacción aprobada, objeciones neutrales y límites del asistente.
- Excluido: precios y planes (pendientes del CCO), descuentos (solo CCO), cifras de resultado (Tier C), clientes y casos (Tier D), años de trayectoria, nombres de competidores, ticket promedio, metas comerciales, RQS, guiones de venta y promesas de integración.
- `KnowledgeBase.load()` carga el corpus solo si `scope=public` y `approval=approved`, y rechaza identificadores duplicados.

**Limitación:** el corpus está solo en español. Un visitante en inglés o portugués no recibe fuentes del corpus; recibe el texto programado de «no encuentro esa información». Hay que traducirlo antes de publicar en esos idiomas.

### Recuperación

Dos cambios en `knowledge_service.py`, validados con las preguntas reales:

1. Una entrada solo puntúa si coincide con la pregunta, o si coincide con al menos dos términos de la respuesta. Así una palabra suelta de una respuesta no trae fuentes ajenas.
2. Las raíces de siete letras (`implementa` e `implementación` comparten base) y el desempate por palabras de la pregunta completa.

## Discrepancias detectadas

Del registro `logixtic-core/01-fuentes-y-discrepancias.md`, las que afectan al público:

- **D-09 / D-10**: nombres de plan (Standard/Enterprise frente a Esencial/Corporativo) y set-up Enterprise (3.500.000 frente a 3.600.000). Por eso no se publican precios.
- **D-14 / D-15**: cifras de resultado y de alcance sin evidencia. Excluidas.
- **D-16**: duración del Diagnóstico sin definir. El corpus dice «se confirma al agendarlo».
- **D-17**: integraciones mencionadas en demos como «futuras». Respuesta neutral.
- **D-11**: años de trayectoria contradictorios. Sin años.
- **D-13**: el Anexo C del Playbook no existe en el PDF.

Observaciones nuevas, para decidir:

- **Precios públicos en el sitio**: `src/components/site/Plans.tsx` muestra planes y precios, pero el Playbook dice que están pendientes de confirmación del CCO (D-10). El agente no los repite; conviene decidir cuál es la versión oficial.
- **Contenido aprobado existente**: `faq-07`, `logix-01` y `faq-11` describen que Logix consulta clientes, DO y pedidos. Es correcto como capacidad, pero hay que confirmar que es lo que se quiere mostrar al público.
- **`faq-13`/`en-faq-13`**: describen seis etapas de implementación. No dan plazos, pero el CCO debería confirmarlas.
- **Corpus y RAG**: el formato del corpus es compatible con `knowledge_ingest.py`, pero no lo indexé en Supabase.

## Pruebas

- **Backend**: 286 pruebas pasan (`backend/.venv/Scripts/python.exe -m pytest -q`). Incluyen:
  - `tests/test_agent_scenarios.py`: los escenarios del encargo, con un transporte simulado. Las respuestas del «modelo» en esas pruebas son textos de prueba; demuestran qué se envía y cómo se etiqueta, no la calidad de OpenRouter.
  - `tests/test_public_corpus.py`: cifras, precios, competidores y promesas excluidos; porcentajes solo en el escenario rotulado; recuperación de las preguntas clave.
  - Pruebas de la API: historial con rol de sistema, más de 6 turnos o turnos de más de 600 caracteres, responden 422.
- **Typecheck y build**: `tsc --noEmit` sin errores; `npm run build` correcto.
- **Navegador** (`visual-evidence/logix-conocimiento/widget-conocimiento.png`): con el backend local en modo prueba, 7 mensajes seguidos. Cada respuesta corresponde a su pregunta, sin errores de consola, y la etiqueta es «DRY-RUN» o «Respuesta programada», nunca «generada por IA».
- **Antes y después**: `visual-evidence/logix-conocimiento/comparacion.md`, generada por `backend/scripts/compare_knowledge.py`. Compara recuperación y etiquetas sin clave; no compara calidad del modelo.

Errores encontrados por las pruebas y corregidos:

- La recuperación combinaba la pregunta actual con el turno anterior siempre que la pregunta fuera corta: «¿Cuánto cuesta?» recibía la fuente de implementación. Ahora la combinación solo ocurre con referencias explícitas, y la pregunta actual tiene prioridad.
- Un carácter de control entró en el patrón de «conversacional» por un escape mal escrito. Está corregido y verificado en bytes.

## Archivos

Modificados:
- `backend/app/services/agent_orchestrator.py`
- `backend/app/services/knowledge_service.py`
- `backend/app/api/v1/ai.py`
- `backend/tests/test_conversation.py` (expectativas intencionales: saludos y «sin fuente» ya usan el modelo)
- `backend/tests/test_rag.py` (una aserción de modo social)
- `src/lib/agent.functions.ts`
- `src/components/experience/AgentWidget.tsx`
- `src/components/experience/agent-widget-labels.ts`

Nuevos:
- `backend/app/knowledge/public_corpus_es.json`
- `backend/scripts/check_openrouter.py`
- `backend/scripts/compare_knowledge.py`
- `backend/tests/test_agent_scenarios.py`
- `backend/tests/test_public_corpus.py`
- `docs/logix-conocimiento-y-agente.md`
- `visual-evidence/logix-conocimiento/` (capturas, comparación)

Sin cambios: el diseño visual, la posición del robot, las animaciones, el saludo de voz y la calculadora ROI.

## Pendiente

1. **Clave de OpenRouter** en `backend/.env` del servidor, y `OPENROUTER_PRIMARY_MODEL` (y fallback). Después, `check_openrouter.py --live`.
2. **Revisión del CCO** del corpus público, de precios y de las discrepancias D-09 a D-17.
3. **Traducción** del corpus a inglés y portugués.
4. **Indexación en Supabase/pgvector**, cuando se autorice. Requiere validar permisos, dimensiones y resultados.
5. **Aviso de privacidad**: `privacy_notice_version` sigue en `pendiente-aprobacion`.
6. **Git**: `backend/app/logixtic-skills/` no está versionado. Decidir si se añade a `.gitignore` o se versiona aparte; no debe llegar al público.
