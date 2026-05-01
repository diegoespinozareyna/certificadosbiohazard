'use client';

import Link from 'next/link';
import moment from 'moment-timezone';
import QRCode from 'react-qr-code';
import { useAuth } from '@/lib/useAuth';

const TZ = 'America/Lima';

function formatearFecha(valor) {
  if (!valor) return null;
  const m = moment.tz(valor, TZ);
  if (!m.isValid()) return null;
  // Capitaliza la primera letra del mes ('abr' → 'Abr')
  const fecha = m.locale('es').format('DD MMM YYYY');
  return fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

function calcularVigencia(fechaVencimiento) {
  if (!fechaVencimiento) return null;
  const venc = moment.tz(fechaVencimiento, TZ).startOf('day');
  if (!venc.isValid()) return null;
  const hoy = moment.tz(TZ).startOf('day');
  const dias = venc.diff(hoy, 'days');
  if (dias < 0) {
    return {
      label: 'Vencido',
      classes: 'bg-red-50 text-red-700 border border-red-200',
      dot: 'bg-red-500',
    };
  }
  if (dias <= 30) {
    return {
      label: `Por vencer (${dias}d)`,
      classes: 'bg-amber-50 text-amber-800 border border-amber-200',
      dot: 'bg-amber-500',
    };
  }
  return {
    label: 'Vigente',
    classes: 'bg-aqua-100 text-aqua-700 border border-aqua-200',
    dot: 'bg-aqua-500',
  };
}

function Campo({ etiqueta, valor }) {
  if (!valor) return null;
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] uppercase tracking-wider text-aqua-800/55 font-medium">
        {etiqueta}
      </span>
      <span className="text-sm text-aqua-900 truncate">{valor}</span>
    </div>
  );
}

export default function TareaItem({ tarea, onDelete }) {
  const { isAuthenticated } = useAuth();
  const vigencia = calcularVigencia(tarea.fechaVencimiento);

  return (
    <li className="group bg-white border border-mist-400 rounded-2xl p-5 shadow-soft hover:border-aqua-400 hover:shadow-[0_14px_40px_-10px_rgba(45,122,100,0.35)] transition-all flex items-start gap-4">
      <span
        className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
          vigencia ? vigencia.dot : 'bg-aqua-200'
        }`}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base text-aqua-900 truncate">
                {tarea.cliente || 'Cliente sin nombre'}
              </h3>
              {tarea.numero != null && (
                <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                  N° {String(tarea.numero).padStart(6, '0')}
                </span>
              )}
            </div>
            <p className="text-xs text-aqua-700 font-mono tracking-wide mt-0.5">
              RUC: <span className="font-semibold">{tarea.ruc}</span>
            </p>
          </div>
          {vigencia && (
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${vigencia.classes}`}
            >
              {vigencia.label}
            </span>
          )}
        </div>

        {tarea.servicios?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tarea.servicios.map((s) => (
              <span
                key={s}
                className="text-xs bg-aqua-50 text-aqua-700 border border-aqua-100 rounded-full px-2.5 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {(tarea.giro || tarea.ubicacion || tarea.areaTratada) && (
          <div className="grid sm:grid-cols-3 gap-3 pt-1">
            <Campo etiqueta="Giro" valor={tarea.giro} />
            <Campo etiqueta="Ubicación" valor={tarea.ubicacion} />
            <Campo
              etiqueta="Área tratada"
              valor={
                tarea.areaTratada != null && tarea.areaTratada !== ''
                  ? `${tarea.areaTratada} m²`
                  : null
              }
            />
          </div>
        )}

        {(tarea.fechaServicio || tarea.fechaEmision || tarea.fechaVencimiento) && (
          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-mist-300">
            <Campo
              etiqueta="Servicio"
              valor={formatearFecha(tarea.fechaServicio)}
            />
            <Campo
              etiqueta="Emisión"
              valor={formatearFecha(tarea.fechaEmision)}
            />
            <Campo
              etiqueta="Vencimiento"
              valor={formatearFecha(tarea.fechaVencimiento)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 shrink-0 items-stretch">
        {tarea.pdfUrl && (
          <div className="bg-white border border-mist-400 rounded-xl p-2 flex flex-col items-center gap-1 shadow-sm">
            {/* QR responsive: grande en mobile (escaneable a distancia desde
                otro celular), compacto en desktop */}
            <div className="w-32 h-32 sm:w-24 sm:h-24 flex items-center justify-center">
              <QRCode
                value={tarea.pdfUrl}
                size={256}
                bgColor="#ffffff"
                fgColor="#1c4940"
                level="M"
                style={{ height: '100%', width: '100%' }}
                aria-label="Código QR del certificado"
              />
            </div>
            {/* <span className="text-[10px] sm:text-[9px] uppercase tracking-wider text-aqua-700 font-semibold">
              Escanéame
            </span> */}
          </div>
        )}
        {tarea.pdfUrl && (
          <a
            href={tarea.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-white bg-aqua-500 rounded-full px-3 py-1.5 hover:bg-aqua-600 transition-colors text-center shadow-soft animate-pulse  "
          >
            Ver Certificado Digital
          </a>
        )}
        {isAuthenticated && (
          <>
            <Link
              href={`/tareas/${tarea._id}/editar`}
              className="text-xs font-medium text-aqua-700 bg-aqua-100 rounded-full px-3 py-1.5 hover:bg-aqua-200 transition-colors text-center"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={() => onDelete(tarea)}
              className="text-xs font-medium text-aqua-700 bg-mist-200 border border-mist-300 rounded-full px-3 py-1.5 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </li>
  );
}
