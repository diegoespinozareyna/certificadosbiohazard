'use client';

// Filtros SVG globales reutilizables. Se renderiza una sola vez en el
// layout. Cualquier elemento puede aplicar el filtro vía:
//   style={{ filter: 'url(#remove-white-bg)' }}
//
// `remove-white-bg` convierte los píxeles blancos de una imagen en
// transparentes (alpha = 0), simulando un PNG con canal alpha sin tener
// que editar el archivo. Funciona incluso cuando el contenedor tiene
// fondo blanco (donde mix-blend-mode falla).
export default function SvgFilters() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id="remove-white-bg" colorInterpolationFilters="sRGB">
          {/*
           * Matriz de color: deja R/G/B intactos y recalcula el alpha como
           *   A' = -3R - 3G - 3B + A + 8
           * - Blanco puro (R=G=B=1):  A' = -9 + 1 + 8 = 0  → transparente
           * - Negro / oscuro (R=G=B=0): A' = 0 + 1 + 8 = 9 → opaco (clamp 1)
           * - Cuasi-blanco (>95%): A' < 1 → semi-transparente (suaviza bordes)
           */}
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    -3 -3 -3 1 8"
          />
        </filter>
      </defs>
    </svg>
  );
}
