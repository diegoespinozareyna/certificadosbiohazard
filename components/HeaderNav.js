'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

const BASE_LINK =
  'text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors whitespace-nowrap';

export default function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { user, isAuthenticated, ready, logout } = useAuth();

  const enNueva = pathname === '/tareas/nueva';
  const enLogin = pathname === '/login';
  const enCertificados =
    !enNueva &&
    (pathname === '/tareas' ||
      pathname.startsWith('/tareas/') ||
      pathname === '/');

  function handleLogout() {
    logout();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <Link
        href="/tareas"
        aria-current={enCertificados ? 'page' : undefined}
        className={`${BASE_LINK} ${
          enCertificados
            ? 'bg-aqua-500 text-white shadow-soft'
            : 'text-aqua-800 hover:bg-aqua-100'
        }`}
      >
        Certificados
      </Link>

      {ready && isAuthenticated && (
        <Link
          href="/tareas/nueva"
          aria-current={enNueva ? 'page' : undefined}
          className={`${BASE_LINK} ${
            enNueva
              ? 'bg-aqua-500 text-white shadow-soft'
              : 'text-aqua-800 hover:bg-aqua-100'
          }`}
        >
          {/* Etiqueta corta en mobile, completa en desktop */}
          <span className="sm:hidden">+ Nuevo</span>
          <span className="hidden sm:inline">Nuevo certificado</span>
        </Link>
      )}

      {ready && isAuthenticated && (
        <div className="flex items-center gap-2 ml-1 sm:ml-2 sm:pl-3 sm:border-l sm:border-mist-300">
          {/* Username solo visible en md+ para no saturar mobile */}
          <span className="hidden md:inline text-xs text-aqua-800/70">
            <span className="font-semibold text-aqua-800">
              {user?.username}
            </span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-aqua-700 bg-mist-200 border border-mist-300 rounded-full px-3 py-1.5 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors whitespace-nowrap"
          >
            <span className="sm:hidden">Salir</span>
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      )}

      {ready && !isAuthenticated && (
        <Link
          href="/login"
          aria-current={enLogin ? 'page' : undefined}
          className={`${BASE_LINK} ml-1 sm:ml-2 ${
            enLogin
              ? 'bg-aqua-700 text-white shadow-soft'
              : 'bg-aqua-500 text-white shadow-soft hover:bg-aqua-600'
          }`}
        >
          <span className="sm:hidden">Ingresar</span>
          <span className="hidden sm:inline">Iniciar sesión</span>
        </Link>
      )}
    </div>
  );
}
