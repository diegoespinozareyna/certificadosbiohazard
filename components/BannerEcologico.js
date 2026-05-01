'use client';

// Banner que se muestra a los visitantes (sin sesión) sobre el compromiso
// ambiental: certificados 100% digitales, sin papel.
export default function BannerEcologico() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-aqua-50 via-aqua-100 to-mist-100 border border-aqua-200 rounded-3xl p-6 md:p-8 shadow-soft animate-fade-in">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="shrink-0 w-32 md:w-44 lg:w-48">
          <img
            src="/saveplanet.png"
            alt="Manos sosteniendo el planeta y un árbol"
            className="w-full h-auto select-none"
            style={{
              // Multiply: el blanco del PNG se mezcla con el fondo aqua del
              // banner y desaparece visualmente — sin filtros agresivos que
              // creen bordes negros.
              mixBlendMode: 'multiply',
            }}
            draggable={false}
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua-700">
            Compromiso ambiental
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-aqua-900 mt-1.5 leading-tight">
            Certificados 100% digitales — Cuidamos el planeta juntos
          </h2>
          <p className="text-sm text-aqua-800/80 mt-3 leading-relaxed max-w-prose">
            Por políticas ambientales de BIOHAZARD E.I.R.L cada certificado que emitimos es digital: cero papel, cero
            residuos. Por cada documento que dejamos de imprimir contribuimos
            a reducir la tala de árboles, el consumo de tinta y la huella de
            carbono. Pequeñas decisiones de hoy son el medio ambiente sano del
            mañana.
          </p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            <Chip>Sin papel</Chip>
            <Chip>Acceso permanente</Chip>
            <Chip>Verificable online</Chip>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="text-xs bg-white/80 backdrop-blur-sm border border-aqua-200 text-aqua-700 rounded-full px-3 py-1 font-medium">
      {children}
    </span>
  );
}

function ManoConPlaneta() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-auto drop-shadow-sm"
    >
      <defs>
        <radialGradient id="bh-planeta" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c1ebde" />
          <stop offset="55%" stopColor="#6fc8ad" />
          <stop offset="100%" stopColor="#2d7a64" />
        </radialGradient>
        <linearGradient id="bh-mano" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fad9b5" />
          <stop offset="100%" stopColor="#d4a373" />
        </linearGradient>
      </defs>

      {/* Aura suave de fondo */}
      <circle cx="100" cy="100" r="92" fill="#dff5ee" opacity="0.55" />

      {/* Mano (cuenco) */}
      <path
        d="M22 145
           Q22 130 38 128
           Q55 128 65 138
           Q85 175 100 175
           Q115 175 135 138
           Q145 128 162 128
           Q178 130 178 145
           Q178 195 100 198
           Q22 195 22 145 Z"
        fill="url(#bh-mano)"
        stroke="#b88254"
        strokeWidth="1.2"
      />
      {/* Pliegues sutiles de la palma */}
      <path
        d="M50 150 Q60 158 70 152"
        stroke="#b88254"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M130 152 Q140 158 150 150"
        stroke="#b88254"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Planeta */}
      <circle cx="100" cy="100" r="48" fill="url(#bh-planeta)" />

      {/* Continentes (formas abstractas) */}
      <path
        d="M82 88 Q94 84 100 92 Q98 104 86 102 Q78 96 82 88 Z"
        fill="#1c4940"
        opacity="0.55"
      />
      <path
        d="M110 86 Q124 90 128 102 Q120 112 112 108 Q104 96 110 86 Z"
        fill="#1c4940"
        opacity="0.55"
      />
      <path
        d="M88 118 Q102 116 112 124 Q106 134 92 130 Q83 124 88 118 Z"
        fill="#1c4940"
        opacity="0.55"
      />

      {/* Brillo del planeta */}
      <ellipse
        cx="84"
        cy="82"
        rx="14"
        ry="6"
        fill="white"
        opacity="0.35"
        transform="rotate(-25 84 82)"
      />

      {/* Hojita creciendo desde el planeta */}
      <path
        d="M100 52 Q112 42 122 50 Q116 64 102 60 Z"
        fill="#399a7c"
      />
      <path
        d="M111 53 L102 60"
        stroke="#1c4940"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
