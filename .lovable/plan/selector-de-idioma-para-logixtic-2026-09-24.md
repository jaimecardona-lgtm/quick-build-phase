# Selector de idioma para Logixtic

## Objetivo
Añadir un selector compacto ES / EN / PT junto al logo y traducir inmediatamente toda la landing sin recargarla, conservando intactos el diseño, las imágenes, las animaciones y la estructura actuales.

## Implementación
- Crear diccionarios internos completos para `es`, `en` y `pt-BR`, incluyendo navegación, secciones, botones, métricas, recursos, FAQ, pie de página, textos alternativos y etiquetas accesibles.
- Incorporar un proveedor de idioma que use español por defecto, restaure la preferencia guardada en `localStorage` tras cargar la página y actualice el atributo `lang` del documento.
- Añadir al encabezado un selector pequeño con icono de globo, código activo y menú accesible para Español, English y Português; mantenerlo visible junto al logo en escritorio y junto al menú en tablet/móvil.
- Conectar todos los componentes existentes al diccionario activo sin cambiar su estructura visual ni sus interacciones.
- Mantener sin traducir Logixtic, Logix, Orbitrack y los nombres de clientes.

## Validación
- Comprobar ES, EN y PT-BR en toda la página, incluidas etiquetas accesibles y contenido interactivo.
- Verificar persistencia al recargar, cambio inmediato sin navegación, y ausencia de mezcla de idiomas.
- Revisar 1440, 1024, 768, 390 y 360 px para evitar cortes, superposiciones o desplazamiento horizontal.
- Confirmar que no existan errores, imágenes rotas ni respuestas 404.
