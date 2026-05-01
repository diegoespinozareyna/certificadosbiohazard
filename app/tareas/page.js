'use client';

import Link from 'next/link';
import TareaList from '@/components/TareaList';
import BannerEcologico from '@/components/BannerEcologico';
import { useAuth } from '@/lib/useAuth';

export default function TareasPage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua-700">
            Operaciones
          </span>
          <h1 className="text-3xl font-bold text-aqua-900 mt-1">
            Certificados
          </h1>
          <p className="text-sm text-aqua-800/75 mt-1">
            {isAuthenticated
              ? 'Emite y gestiona los certificados de saneamiento por cliente.'
              : 'Consulta certificados de saneamiento por RUC y descarga el PDF.'}
          </p>
        </div>
        {isAuthenticated && (
          <Link
            href="/tareas/nueva"
            className="bg-aqua-500 text-white rounded-full px-5 py-2.5 font-medium hover:bg-aqua-600 transition-colors shadow-soft"
          >
            + Nuevo certificado
          </Link>
        )}
      </div>

      {/* Banner ecológico SOLO para visitantes sin sesión, antes del buscador */}
      {!isAuthenticated && <BannerEcologico />}

      <TareaList />
    </section>
  );
}
