'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TareaForm from '@/components/TareaForm';
import { createTarea, updateTarea, authHeaders } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { generarCertificadoPdf } from '@/lib/pdf/generarCertificadoPdf';
import { mostrarLoadingPdf, ocultarLoadingPdf } from '@/lib/pdf/loading';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function NuevaTareaPage() {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();

  // Si no hay sesión, redirige a /login.
  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace('/login');
    }
  }, [ready, isAuthenticated, router]);

  async function handleSubmit(datos) {
    console.log('[payload]', datos);
    mostrarLoadingPdf();

    let cert = null;
    try {
      // 1. Persistir el certificado en Mongo (Mongo asigna `numero` correlativo).
      console.log('[1/5] guardando cert en Mongo…');
      cert = await createTarea(datos);
      console.log('  ✓ cert creado — numero:', cert.numero, '_id:', cert._id);

      // 2. Generar el PDF con el cert (incluye el numero rojo en cabecera).
      console.log('[2/5] generando PDF…');
      const pdfDocGenerator = await generarCertificadoPdf(cert);

      // 3. Blob del PDF (Promise API de pdfmake 0.3.x).
      console.log('[3/5] obteniendo Blob…');
      const blob = await pdfDocGenerator.getBlob();
      console.log('  ✓ blob:', blob.size, 'bytes');

      // 4. Abrir en pestaña nueva para verificación visual.
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

      // 5. Subir a R2 vía multipart/form-data → backend → R2 (server-side).
      console.log('[4/5] subiendo PDF a R2…');
      const pdfFile = new File(
        [blob],
        `certificado-${cert.ruc}-${cert._id}.pdf`,
        { type: 'application/pdf' }
      );
      const formData = new FormData();
      formData.append('image', pdfFile, pdfFile.name);
      formData.append('ruta', 'biohazard');
      formData.append('filename', pdfFile.name);

      const res = await fetch(`${API_URL}/upload/pdf`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      console.log('  ✓ R2 respuesta:', res.status, json);

      if (!res.ok || json.ok === false || !json.url) {
        throw new Error(
          json.error ||
            'R2 no devolvió url. Verifica R2_PUBLIC_URL en backend/.env'
        );
      }

      // 6. Persistir la URL en el cert.
      console.log('[5/5] guardando pdfUrl en cert…');
      await updateTarea(cert._id, { pdfUrl: json.url });
      console.log('🔗 URL FINAL:', json.url);
      console.log('=== ✓ flujo completado ===');
    } catch (err) {
      console.error('[handleSubmit] error:', err);
      alert(`❌ ${err.message}`);
    } finally {
      ocultarLoadingPdf();
    }

    // Si el cert se creó (con o sin pdfUrl) → redirigir a la lista.
    if (cert) {
      router.push('/tareas');
      router.refresh();
    }
  }

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <div className="text-sm text-aqua-700">
        <Link href="/tareas" className="hover:underline">
          ← Volver a certificados
        </Link>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua-700">
          Operaciones
        </span>
        <h1 className="text-3xl font-bold text-aqua-900 mt-1">
          Nuevo certificado
        </h1>
        {/* <p className="text-sm text-aqua-800/75 mt-1">
          Guarda en Mongo (asigna número), genera PDF, lo abre en pestaña nueva,
          lo sube a R2 y persiste la URL pública.
        </p> */}
      </div>
      <div className="bg-white border border-mist-300 rounded-2xl p-6 shadow-soft">
        <TareaForm onSubmit={handleSubmit} submitLabel="Crear certificado" />
      </div>
    </section>
  );
}
