'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(username.trim(), password);
      router.push('/tareas');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const inputBase =
    'w-full rounded-xl border border-mist-300 bg-mist-100 px-4 py-2.5 text-aqua-900 placeholder:text-aqua-800/40 outline-none transition-all focus:border-aqua-400 focus:bg-white focus:ring-4 focus:ring-aqua-200/60';

  return (
    <section className="flex flex-col gap-8 max-w-sm mx-auto py-10 animate-fade-in">
      <div className="text-sm text-aqua-700">
        <Link href="/" className="hover:underline">
          ← Inicio
        </Link>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua-700">
          Acceso administrador
        </span>
        <h1 className="text-3xl font-bold text-aqua-900 mt-1">
          Iniciar sesión
        </h1>
        <p className="text-sm text-aqua-800/75 mt-1">
          Solo el administrador puede crear, editar o eliminar certificados.
          Sin sesión puedes buscar y ver PDFs.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-mist-300 rounded-2xl p-6 shadow-soft flex flex-col gap-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800">Usuario</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputBase}
            placeholder="admin"
            autoComplete="username"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputBase}
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="bg-aqua-500 text-white font-medium rounded-full px-6 py-2.5 hover:bg-aqua-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-soft"
        >
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}
