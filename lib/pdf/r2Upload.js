'use client';

const BASE_URL =
  "https://api.certificadosbiohazard.com/api" || 'http://localhost:4000/api';

// Mismo patrón que el ejemplo handleArras:
//   - Convierte el blob a File
//   - FormData con campo "image"
//   - POST multipart/form-data
export async function subirPdfACertR2(blob, cert) {
  const idSafe = cert?._id || `nuevo-${Date.now()}`;
  const rucSafe = (cert?.ruc || 'sin-ruc').replace(/\s+/g, '');
  const filename = `certificado-${rucSafe}-${idSafe}.pdf`;

  const pdfFile = new File([blob], filename, { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('image', pdfFile, filename);
  formData.append('ruta', 'biohazard');
  formData.append('filename', filename);

  const url = `${BASE_URL}/upload/pdf`;
  console.log('[R2] subiendo PDF →', url, `(${blob.size} bytes)`);

  // No setear Content-Type: el browser lo arma con el boundary correcto.
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  console.log('[R2] respuesta:', res.status, json);

  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `Upload falló (${res.status})`);
  }

  if (!json.url) {
    throw new Error(
      'Upload OK pero falta R2_PUBLIC_URL en el backend para componer la URL pública'
    );
  }

  return json.url;
}
