'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getTareas, deleteTarea } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import TareaItem from './TareaItem';
import ConfirmDialog from './ConfirmDialog';

export default function TareaList() {
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState('');
  const [rucActivo, setRucActivo] = useState('');
  const [tareas, setTareas] = useState([]);
  const [estado, setEstado] = useState('idle'); // idle | cargando | listo | error
  const [error, setError] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  async function buscar(rucBusqueda) {
    const ruc = rucBusqueda.trim();
    if (!ruc) return;
    setRucActivo(ruc);
    setEstado('cargando');
    setError(null);
    try {
      const data = await getTareas(ruc);
      setTareas(data);
      setEstado('listo');
    } catch (err) {
      setError(err.message);
      setEstado('error');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    buscar(input);
  }

  function limpiar() {
    setInput('');
    setRucActivo('');
    setTareas([]);
    setEstado('idle');
    setError(null);
  }

  async function confirmarEliminar() {
    if (!aEliminar) return;
    try {
      await deleteTarea(aEliminar._id);
      setTareas((prev) => prev.filter((t) => t._id !== aEliminar._id));
    } catch (err) {
      setError(err.message);
      setEstado('error');
    } finally {
      setAEliminar(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-mist-300 rounded-2xl p-4 shadow-soft flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        <div className="flex-1 flex items-center gap-2 bg-mist-100 border border-mist-300 rounded-xl px-3 py-2 focus-within:border-aqua-400 focus-within:ring-4 focus-within:ring-aqua-200/60 transition-all">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-aqua-600 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\s+/g, ''))}
            inputMode="numeric"
            placeholder="Buscar certificados por RUC…"
            className="flex-1 bg-transparent outline-none text-aqua-900 placeholder:text-aqua-800/40 font-mono tracking-wide"
          />
          {rucActivo && (
            <button
              type="button"
              onClick={limpiar}
              className="text-xs font-medium text-aqua-700 hover:text-aqua-900 px-2"
              aria-label="Limpiar búsqueda"
            >
              Limpiar
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!input.trim() || estado === 'cargando'}
          className="bg-aqua-500 text-white font-medium rounded-full px-6 py-2.5 hover:bg-aqua-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-soft"
        >
          {estado === 'cargando' ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {rucActivo && estado !== 'cargando' && (
        <p className="text-sm text-aqua-800/70 -mt-2">
          {tareas.length === 0
            ? 'Sin resultados'
            : `${tareas.length} certificado${tareas.length === 1 ? '' : 's'}`}
          {' '}para RUC{' '}
          <span className="font-mono font-semibold text-aqua-900">{rucActivo}</span>
        </p>
      )}

      {estado === 'idle' && (
        <div className="bg-white border border-dashed border-aqua-300 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
          <span className="w-14 h-14 rounded-full bg-aqua-100 text-aqua-600 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </span>
          <p className="font-semibold text-aqua-900">
            Busca certificados por RUC
          </p>
          <p className="text-sm text-aqua-800/70 max-w-sm">
            Ingresa el RUC del cliente en el buscador para ver sus
            certificados registrados.
          </p>
        </div>
      )}

      {estado === 'cargando' && (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="bg-white/60 border border-mist-300 rounded-2xl p-5 animate-pulse h-24"
            />
          ))}
        </ul>
      )}

      {estado === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Error: {error}
        </div>
      )}

      {estado === 'listo' && tareas.length === 0 && (
        <div className="bg-white border border-dashed border-aqua-300 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
          <span className="w-14 h-14 rounded-full bg-aqua-100 text-aqua-600 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                d="M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11z"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="font-semibold text-aqua-900">
            No hay certificados para este RUC
          </p>
          <p className="text-sm text-aqua-800/70 max-w-sm">
            Aún no se ha emitido ningún certificado para el RUC{' '}
            <span className="font-mono">{rucActivo}</span>.
          </p>
          {isAuthenticated && (
            <Link
              href="/tareas/nueva"
              className="mt-2 bg-aqua-500 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-aqua-600 transition-colors shadow-soft"
            >
              + Crear certificado para este RUC
            </Link>
          )}
        </div>
      )}

      {estado === 'listo' && tareas.length > 0 && (
        <ul className="flex flex-col gap-3">
          {tareas.map((tarea) => (
            <TareaItem key={tarea._id} tarea={tarea} onDelete={setAEliminar} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(aEliminar)}
        title="Eliminar certificado"
        message={`¿Seguro que quieres eliminar el certificado de "${aEliminar?.cliente || 'este cliente'}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
}
