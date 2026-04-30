'use client';

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aqua-900/30 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-mist-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 9v4m0 4h.01M10.3 4.3 2.7 17.7c-.6 1 .1 2.3 1.3 2.3h16c1.2 0 1.9-1.3 1.3-2.3L13.7 4.3a1.5 1.5 0 0 0-2.6 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-aqua-900">{title}</h2>
            <p className="text-sm text-aqua-800/80 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-mist-200 text-aqua-800 rounded-full px-5 py-2 text-sm font-medium hover:bg-mist-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-red-700 transition-colors shadow-soft"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
