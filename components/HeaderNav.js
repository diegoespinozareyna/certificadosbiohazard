'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

const BASE_LINK =
  'text-sm font-medium px-4 py-2 rounded-full transition-colors';

export default function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { user, isAuthenticated, ready, logout } = useAuth();

  // Reglas de "ruta activa":
  //   /tareas               → Certificados
  //   /tareas/{id}/editar   → Certificados (editar también pertenece a la lista)
  //   /tareas/nueva         → Nuevo certificado
  //   /login                → Iniciar sesión
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
    <div className="flex items-center gap-1">
      <Link
        href="/tareas"
        aria-current={enCertificados ? 'page' : undefined}
        className={`${BASE_LINK} ${enCertificados
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
          className={`${BASE_LINK} ${enNueva
              ? 'bg-aqua-500 text-white shadow-soft'
              : 'text-aqua-800 hover:bg-aqua-100'
            }`}
        >
          Nuevo certificado
        </Link>
      )}

      {ready && isAuthenticated && (
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-mist-300">
          <span className="text-xs text-aqua-800/70">
            <span className="font-semibold text-aqua-800">
              {user?.username}
            </span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-aqua-700 bg-mist-200 border border-mist-300 rounded-full px-3 py-1.5 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {ready && !isAuthenticated && (
        <Link
          href="/login"
          aria-current={enLogin ? 'page' : undefined}
          className={`${BASE_LINK} ml-2 ${enLogin
              ? 'bg-aqua-700 text-white shadow-soft'
              : 'bg-aqua-500 text-white shadow-soft hover:bg-aqua-600'
            }`}
        >
          Iniciar sesión
        </Link>
      )}
    </div>
  );
}
