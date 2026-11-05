# Inventario de recursos de public/ (fase 3G)

Criterio: un recurso se conserva solo si su procedencia está documentada o es decisión ya tomada; si no hay autorización escrita, se sustituye o se retira. Nada se presenta como aprobado sin documentación.

## Conservados
| Recurso | Consumidor | Motivo |
|---|---|---|
| `assets/0[1-8]-*.webp` (capturas del producto) | Platform, Services, Hero | Capturas propias de Logixtic (manifiesto: propiedad Logixtic, confirmar) |
| `assets/logixtic-logo-negativo-transparente.png`, `favicon.png`, `robots.txt` | Header, layout, SEO | Marca propia |
| `__l5e/.../logix-transparent.png` | AgentWidget, LogixAI | Personaje Logix oficial (AGENTS.md) |
| `__l5e/.../logixtic-closing-official.png` | Closing | Logo oficial de cierre (AGENTS.md) |
| `__l5e/.../closing-globe-v2.webp` | Globo de conectividad | Efecto autorizado por el equipo; procedencia pendiente de documentar |
| `__l5e/.../hero-platform.webp` | Hero | Visual de producto; confirmar procedencia |
| `__l5e/.../logixtic-port-hero.webp` | Hero cinematográfico (forwarders-v2) | **Procedencia no documentada** (manifiesto: in-use-provisional). Pendiente |
| `__l5e/.../iso-28000-seal.png` | Footer (ISO 28000) | Sello suministrado por el usuario (AGENTS.md); con la aclaración de referencia, no certificación |
| `media/img/*.jpg`, `media/img/bg/*.webp` | Flow, Problem, Implementation (escenas) | Fotografías de producto y derivados; **licencia pendiente** de confirmar |

## Sustituidos por placeholder neutral (misma ruta y tamaño; originales en respaldo)
| Recurso | Consumidor | Motivo |
|---|---|---|
| 12 logos de clientes (`__l5e/.../rr-logistics`, `connecta-global-logistics-hd`, `global-freight-hd`, `grupo-bsp-hd`, `logistics-solutions-hd`, `navis-hd`, `sc-itrading-hd`, `swift-cargo-hd`, `trade-business-sas-hd`, `transinternational-cargo-hd`, `transmares-usa-hd`, `clm-cargo-hd`) | Carrusel de clientes | Sin autorización escrita documentada (AGENTS/Zenox: "publicarán con autorización escrita") |
| 3 logos de casos (`logo-connecta-global-logistics`, `logo-rr-logistics-cfs`, `logo-trade-business-sas`) | Casos de éxito | Igual que arriba |
| `oea-colombia.webp`, `basc-official.svg` | Footer | Sellos de terceros; uso no confirmado (auditoría: "confirmar autorización de uso") |
| `paperless.png`, `zerowaste.png` | Footer | No son certificaciones documentadas; uso no confirmado |

## Retirados del artefacto (respaldo conservado)
| Recurso | Motivo |
|---|---|
| `__l5e/`: `basc.png`, `oea.png`, `iso.png` | Duplicados no referenciados |
| `__l5e/`: `logix1.jpeg`, `cost-analysis.jpg`, `shipment-profitability.webp`, `transport-quotes.webp`, `team-collaboration.jpg`, `fragmented-paperwork.jpg`, `disconnected-documents.webp`, `logixtic-control-center.png` | Sin consumidor en `src/` |
| `imagenes feedback/` (10 imágenes) | Solo referenciadas en un comentario de `WhyChooseUs.tsx` ("referencia visual, no se incrusta"). Procedencia no documentada |
| `media/cinematic/` (25 archivos: vídeos y posters) | Ningún vídeo aprobado (`license-manifest`: "no-approved-video-assets"). Manifiesto copiado en `license-manifest-cinematic.json` |

## Excluidos desde antes
- `Logixtic_C4_Arquitectura_Interactiva.html`: ya no está en `public/` en la base `12832f9` (retirado en `62e6370`); copia en `docs/productization/archive/`.

## Pendientes de decisión comercial
1. Autorización escrita de los 15 logos de clientes; si se obtiene, restaurar desde `respaldo-recursos-originales/sustituidos-por-placeholder/`.
2. Confirmar uso de sellos OEA y BASC, y naturaleza de Paperless y Zero Waste.
3. Procedencia de `logixtic-port-hero.webp`, `closing-globe-v2.webp`, `hero-platform.webp` y las fotografías de `media/img/`.
4. Decidir si el material de feedback retirado se reincorpora en la Home.
