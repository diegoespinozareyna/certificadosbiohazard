// ───────────────────────────────────────────────────────────────────
// Helpers para PDF (cliente)
// ───────────────────────────────────────────────────────────────────

// Carga una imagen pública como data URL (devuelve null si falla).
export async function getBase64FromPublic(publicPath) {
  try {
    const response = await fetch(publicPath);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`getBase64FromPublic(${publicPath}) falló:`, err);
    return null;
  }
}

// Re-encoda una imagen a JPEG con fondo blanco vía canvas.
// JPEG en lugar de PNG porque:
//   - pdfkit (lo que pdfmake usa por debajo) digiere JPEG sin problemas
//   - PNGs con alpha, perfiles ICC, interlacing o profundidades raras
//     cuelgan pdfmake (getBlob nunca llama el callback)
//   - JPEG es más chico y el PDF resultante también
//
// Si la imagen no carga en 8s, devuelve null (mejor que colgar todo).
export async function normalizarImagen(dataUrl, maxAncho = 300) {
  if (!dataUrl) return null;
  if (typeof window === 'undefined') return dataUrl;

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn('[normalizarImagen] timeout 8s — devolviendo null');
      resolve(null);
    }, 8000);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const escala = Math.min(1, maxAncho / img.naturalWidth);
        const w = Math.max(1, Math.round(img.naturalWidth * escala));
        const h = Math.max(1, Math.round(img.naturalHeight * escala));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // Fondo blanco para aplanar canales alpha (firmas, transparencias).
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        // JPEG con calidad 85 — sin alpha, sin perfiles, súper compatible.
        const limpio = canvas.toDataURL('image/jpeg', 0.85);
        console.log(
          `[normalizarImagen] ${img.naturalWidth}x${img.naturalHeight} → ${w}x${h} JPEG (${Math.round(limpio.length / 1024)}KB)`
        );
        resolve(limpio);
      } catch (err) {
        console.warn('[normalizarImagen] canvas falló:', err);
        resolve(null);
      }
    };
    img.onerror = (err) => {
      clearTimeout(timeoutId);
      console.warn('[normalizarImagen] no se pudo cargar:', err);
      resolve(null);
    };
    img.src = dataUrl;
  });
}

import moment from 'moment-timezone';

// Zona horaria fija de la empresa (Perú). Cualquier fecha se formatea en
// Lima sin importar el TZ del cliente o del servidor.
export const TZ = 'America/Lima';

export function formatearFechaCorta(valor) {
  if (!valor) return '';
  const m = moment.tz(valor, TZ);
  if (!m.isValid()) return '';
  return m.format('DD/MM/YYYY');
}

// Formatea el "área tratada" para mostrarlo SIEMPRE en MAYÚSCULAS.
// Acepta números y/o letras. Reglas:
//   - Si contiene algún número y aún NO trae la unidad → agrega " M2".
//   - Si ya trae la unidad (m2 / m² en cualquier forma) → no la duplica
//     y la normaliza a "M2".
//   - Si solo tiene letras (sin números) → va tal cual en MAYÚSCULAS
//     (ej. "ÁREA TOTAL"), sin unidad.
export function formatearArea(valor) {
  if (valor == null) return '';
  const texto = String(valor).trim();
  if (texto === '') return '';

  const mayus = texto.toUpperCase();
  const tieneNumero = /\d/.test(texto);
  if (!tieneNumero) return mayus;

  const tieneUnidad = /M\s*2|M\s*²/.test(mayus);
  if (tieneUnidad) {
    // Normaliza cualquier "M²" / "M 2" ya escrito a "M2" (sin duplicar).
    return mayus.replace(/M\s*²/g, 'M2').replace(/M\s+2/g, 'M2');
  }
  return `${mayus} M2`;
}
