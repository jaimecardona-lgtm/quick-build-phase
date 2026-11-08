# Logixtic® · Sistema de 6 Skills Comerciales + Núcleo

## Contenido
| Skill | Función | Depende de |
|---|---|---|
| `logixtic-core` | Núcleo: fuentes, Playbook esencial, claims/cumplimiento, motor conversacional, calibración | — |
| `logixtic-lead-hunter` (1) | Encuentra y califica empresas (ICP, arquetipo, RQS preliminar, campos CRM) | core |
| `logixtic-account-intelligence` (2) | Briefing ejecutivo de cuenta y de reunión | core |
| `logixtic-sales-outreach` (3) | SETEO, secuencias multicanal, guiones, contenido y marketing digital | core |
| `logixtic-discovery-coach` (4) | Prepara, guía y analiza el Diagnóstico; COI/ROI; SQO | core |
| `logixtic-proposal-builder` (5) | Propuesta y business case con storytelling y copy de ventas | core |
| `logixtic-sales-coach` (6) | Entrenamiento, evaluación, PMC, pipeline review, role-play | core |

Flujo: Lead Hunter → Account Intelligence → Sales Outreach → Discovery Coach → Proposal Builder. Sales Coach es transversal.

## Instalación
Copiar las 7 carpetas juntas en la ubicación de skills (p. ej. `/mnt/skills/user/`). Los 6 skills leen `logixtic-core/references/*` por nombre de carpeta: **no renombrar** `logixtic-core`.

## Decisiones aplicadas (de tus respuestas)
Diagnóstico como término · voz del vendedor a nombre de Logixtic® · mecánica de SETEO sin contenido AGO · marketing digital completo · Lead Hunter con web y sin herramientas de pago · 13 campos CRM · metas SDR 40/50/30 · Proposal Builder enfocado en discurso · Sales Coach para todos los roles · Discovery Coach táctico y Sales Coach de desarrollo · español por país.

## Desviaciones deliberadas respecto al Playbook (requieren visto bueno del CCO)
1. **Sin cifras de resultado hacia el prospecto** (70 %, 500 h, 2x, 4 semanas…), aunque el Playbook las use en scripts (p. ej. apertura 5.6). Motivo: no hay evidencia (C-09). El impacto se calcula con los datos del prospecto (COI) y se muestra en **escenarios editables**.
2. **Sin casos, logos, ">700 agentes" ni años de trayectoria** (D-11, D-15).
3. **Sin promesa de integraciones** (D-17).
4. **RQS preliminar** limitado a 50 puntos evidenciables públicamente (D-08).

## Pendientes por resolver (ver `logixtic-core/references/01-fuentes-y-discrepancias.md`)
- Discrepancias D-01 a D-19 (ticket, metas de KPIs, plan/precios, 110 vs 100 puntos, años, roles del BDR…).
- C-18 canal primario del seteo · C-19 cadencia · C-20 política de descuentos.
- Anexo C del Playbook (ejecución táctica) no está en el PDF.
- Duración estándar del Diagnóstico (D-16) y razón social (D-18).

## Estado de validación
Redactados y revisados internamente; **no probados con casos reales**. Siguiente paso recomendado: correr 4–6 casos por skill (incluidos casos de fuera de ICP y de claims prohibidos), comparar contra la rúbrica del Sales Coach y ajustar. La calibración con transcripciones (`05`) se basa en lectura parcial; requiere un análisis línea a línea.
