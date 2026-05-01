'use client';

// Marca de agua de fondo de toda la página: equipo de fumigación,
// difuminado y translúcido. Adaptable a mobile/desktop:
//   - Móvil: bg-contain → la imagen completa se ve (no recorta a la persona)
//   - Desktop ≥ sm: bg-cover → llena toda la pantalla
// Posición centrada en ambos casos para que la persona fumigando quede en
// el centro visual.
export default function Watermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-no-repeat bg-center bg-contain sm:bg-cover"
      style={{
        backgroundImage: 'url(/servicio-de-fumigacion-de-abejas.jpg)',
        opacity: 0.2,
        filter: 'blur(0.5px) saturate(1)',
      }}
    />
  );
}
