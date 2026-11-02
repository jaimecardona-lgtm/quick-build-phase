# 06 — Tavily como herramienta administrativa del backend

Estado: **implementado, apagado por defecto, fuera del chat**. Una búsqueda real de prueba (1 crédito).

## Principio

Tavily es una herramienta de **investigación administrativa**, no parte de la respuesta al visitante. El
orquestador del chat no importa ni llama al servicio web (lo verifica una prueba). Saludos, cortesía y preguntas
con fuente aprobada nunca lo usan. No hay llamadas por mensaje.

## Componentes

| Archivo | Responsabilidad |
|---|---|
| `app/core/config.py` | Configuración tipada: `TAVILY_ENABLED` (false), `TAVILY_API_KEY`, timeout (6 s, máx. 10), profundidad (`basic`), resultados (5, máx. 10), Extract apagado, lista de dominios, presupuesto diario de créditos (20), caché (60 min) |
| `app/integrations/tavily_client.py` | Cliente de **Search** y **Extract** (`/search`, `/extract`). Clave solo en `Authorization: Bearer`. Errores por categoría: `config`, `auth`, `quota`, `timeout`, `network`, `http`, `invalid` |
| `app/services/web_policy.py` | Anti-SSRF: solo HTTPS, puerto 443, sin credenciales ni IP literales, sin hosts internos, lista permitida, DNS a IP pública. Sanitiza consultas (sin datos personales, identificadores de embarque ni términos de operación). Delimita contenido externo como no confiable |
| `app/services/budget.py` | `CreditBudget`: presupuesto diario de créditos con reembolso si la llamada falla |
| `app/services/web_research.py` | Servicio: caché con TTL, deduplicación de URLs, filtrado por política, límite de frecuencia (5/min), presupuesto antes de cada llamada, registro seguro |
| `app/services/web_candidates.py` | Convierte contenido extraído en **candidatos pendientes** (`approved=false`, versión que no se publica) |

## Garantías verificadas (pruebas simuladas, 40)

- Clave en cabecera Bearer; nunca en errores ni en logs.
- 401/403 → `auth`; 429/432/433 → `quota`; 5xx → `http`; timeout y red → sus categorías; JSON inválido → `invalid`.
- Resultados vacíos no son error.
- Caché: misma consulta (normalizada) no consume créditos dos veces.
- Deduplicación por URL dentro de un resultado.
- Presupuesto agotado → sin llamada; fallo → crédito reembolsado.
- Tavily apagado → sin red.
- Extract apagado por defecto; URLs inseguras se rechazan antes de cualquier llamada.
- SSRF: HTTP, credenciales, puerto distinto de 443, IP literal (incluida 169.254.169.254), localhost, sufijos
  internos, dominios fuera de la lista y DNS a direcciones privadas → rechazados.
- Consultas con email, identificadores de embarque, facturas, clientes o más de 200 caracteres → no salen.
- Contenido externo: etiquetas neutralizadas para que no puedan cerrar el bloque.
- Candidatos: sin datos personales, `approved=false`, identificador estable por URL.

## Prueba real (una sola)

Búsqueda `basic`, `max_results=1`, consulta pública genérica. Resultado: **1 resultado, 1 crédito, 1,9 s**,
dominio público HTTPS. El contenido no se guardó ni se imprimió.

## Pendiente (no implementado a propósito)

- **Extract real** (URLs de la lista permitida): implementado y probado en simulación; no ejecutado en real.
- **Crawl**: no implementado.
- **Candidatos en Supabase**: la función de construcción existe; la escritura remota de candidatos (con
  embeddings) no se ha ejecutado. Requiere decidir la lista de dominios permitidos.
- **Parámetro `include_domains` de Tavily**: no confirmado en la documentación; el filtrado se hace en nuestro
  código, que es más estricto.
- **Uso desde la interfaz administrativa**: no existe; el servicio se usa desde código.
