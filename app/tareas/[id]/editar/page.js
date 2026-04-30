'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TareaForm from '@/components/TareaForm';
import { getTarea, updateTarea, authHeaders } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { generarCertificadoPdf } from '@/lib/pdf/generarCertificadoPdf';
import { mostrarLoadingPdf, ocultarLoadingPdf } from '@/lib/pdf/loading';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EditarTareaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { isAuthenticated, ready } = useAuth();

  const [tarea, setTarea] = useState(null);
  const [error, setError] = useState(null);

  // Si no hay sesión, redirige a /login.
  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace('/login');
    }
  }, [ready, isAuthenticated, router]);

  useEffect(() => {
    if (!id) return;
    getTarea(id).then(setTarea).catch((err) => setError(err.message));
  }, [id]);

  async function handleSubmit(datos) {
    console.log('[payload]', datos);
    mostrarLoadingPdf();

    let cert = null;
    try {
      // 1. Actualizar los datos del cert (mantiene su `numero`).
      console.log('[1/5] actualizando cert…');
      cert = await updateTarea(id, datos);
      console.log('  ✓ cert actualizado — numero:', cert.numero);

      // 2. Regenerar PDF con los datos nuevos.
      console.log('[2/5] regenerando PDF…');
      const pdfDocGenerator = await generarCertificadoPdf(cert);

      // 3. Blob (Promise API de pdfmake 0.3.x).
      console.log('[3/5] obteniendo Blob…');
      const blob = await pdfDocGenerator.getBlob();
      console.log('  ✓ blob:', blob.size, 'bytes');

      // 4. Abrir el PDF nuevo en pestaña.
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

      // 5. Subir nueva versión a R2.
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

      // 6. Sobrescribir pdfUrl con la versión nueva.
      console.log('[5/5] guardando pdfUrl actualizado…');
      await updateTarea(id, { pdfUrl: json.url });
      console.log('🔗 URL FINAL:', json.url);
    } catch (err) {
      console.error('[handleSubmit] error:', err);
      alert(`❌ ${err.message}`);
    } finally {
      ocultarLoadingPdf();
    }

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
          Editar certificado
        </h1>
        <p className="text-sm text-aqua-800/75 mt-1">
          Al guardar se actualiza el cert, se regenera el PDF y se sube una
          versión nueva a R2.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!tarea && !error && (
        <div className="bg-white border border-mist-300 rounded-2xl p-6 shadow-soft text-aqua-800/70 text-sm">
          Cargando certificado…
        </div>
      )}

      {tarea && (
        <div className="bg-white border border-mist-300 rounded-2xl p-6 shadow-soft">
          <TareaForm
            initialData={tarea}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        </div>
      )}
    </section>
  );
}
