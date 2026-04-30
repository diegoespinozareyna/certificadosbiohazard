# lib/pdf

Generación del certificado en PDF (cliente) y subida a Cloudflare R2.

## Cómo funciona

`generarCertificadoPdf(cert)` construye **todo el layout del certificado dentro de pdfmake** — no requiere ningún asset externo para funcionar. Recrea: cabecera con datos de la empresa, franja lateral con normativa, título "CERTIFICADO", checkboxes de los 5 servicios (marcando los seleccionados), bloque de datos del cliente (cliente, ubicación, giro, área tratada, fechas) y bloque de firmas.

## Imágenes opcionales

Si quieres que el PDF se vea más fiel al original, coloca cualquiera (todos opcionales) de estos archivos en `frontendbiohazard/public/`:

- `biohazard-logo.png` — logo de la empresa (reemplaza el "BIOHAZARD" en texto de la esquina superior izquierda).
- `firma-director.png` — sello/firma del Director técnico (sobre la línea inferior izquierda).
- `firma-gerente.png` — sello/firma del Gerente General (sobre la línea inferior derecha).

`getBase64FromPublic` los carga si existen y los ignora silenciosamente si no — la generación del PDF nunca se rompe por falta de assets.

## Subida a R2

`subirPdfACertR2(blob, cert)`:
1. Pide signed URL al backend (`POST /api/upload/sign` con `ruta="biohazard"`).
2. `PUT` directo al `uploadUrl` con el blob y `Content-Type: application/pdf`.
3. Devuelve el `publicUrl` que el frontend guarda en `cert.pdfUrl` con un segundo `updateTarea`.

## Variables de entorno (backend)

`backendbiohazard/.env` debe tener: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_S3_API_URL`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`. Sin `R2_PUBLIC_URL` el PUT funciona pero el frontend recibe `publicUrl=null` y `subirPdfACertR2` lanza error (el certificado igual queda guardado en Mongo gracias al `try/catch` en las páginas).

## Flujo

`app/tareas/nueva/page.js` y `app/tareas/[id]/editar/page.js`:
1. `createTarea` / `updateTarea` → certificado en MongoDB.
2. `generarCertificadoPdf(cert)` → `Blob`.
3. `subirPdfACertR2(blob, cert)` → URL pública.
4. `updateTarea(cert._id, { pdfUrl })` → URL persistida.

Cualquier fallo después del paso 1 se loggea y deja el certificado igual creado.
