# Animación SVG del Hero

## Alcance
- Mantener fija la imagen actual, el overlay, el texto, los botones y el encabezado.
- Añadir sobre la fotografía una capa SVG transparente que siga únicamente las conexiones digitales ya visibles.
- Animar pulsos azules y amarillos con ritmos diferenciados, puntos móviles limitados y variaciones suaves de intensidad.
- Reducir los elementos animados en móvil y dejar la capa estática con movimiento reducido.

## Implementación
- Incorporar el SVG dentro del componente existente del Hero, detrás del overlay y sin interceptar interacción.
- Sustituir el zoom actual por animaciones CSS de `stroke-dashoffset`, opacidad y desplazamiento mínimo de la capa.
- Pausar la animación cuando el Hero no esté visible para reducir consumo.

## Validación
- Comprobar escritorio y móvil: imagen fija, texto fijo, trazos alineados, sin desbordamiento ni errores.
- Comprobar `prefers-reduced-motion`: líneas visibles, sin movimiento.
