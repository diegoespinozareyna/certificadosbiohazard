'use client';

import QRCode from 'qrcode';
import {
  getBase64FromPublic,
  normalizarImagen,
  formatearFechaCorta,
  formatearArea,
} from './helpers';

// URL pública del backend — la misma que usa lib/api.js. El QR encoded
// apunta a /api/tareas/:id/pdf, que redirige (302) al pdfUrl actual.
const QR_API_BASE =
  'https://api.certificadosbiohazard.com/api' ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api';

// Genera un QR como dataURL PNG. Devuelve null si falla.
async function generarQrDataUrl(certId) {
  if (!certId) return null;
  try {
    const url = `${QR_API_BASE}/tareas/${certId}/pdf`;
    return await QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: { dark: '#1c4940', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.warn('[QR] no se pudo generar:', err);
    return null;
  }
}

// Cargamos pdfmake y las fuentes de forma dinámica SOLO en el cliente.
// IMPORTANTE: pdfmake 0.3.x cambió la forma de exportar el vfs.
//   0.2.x: vfs_fonts exportaba { pdfMake: { vfs: {...} } }
//   0.3.x: vfs_fonts exporta DIRECTAMENTE el objeto vfs
async function cargarPdfMake() {
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  // Detección defensiva del vfs en cualquiera de las versiones.
  let vfs = null;
  if (pdfFonts?.pdfMake?.vfs) {
    vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts?.vfs) {
    vfs = pdfFonts.vfs;
  } else if (
    pdfFonts &&
    typeof pdfFonts === 'object' &&
    Object.keys(pdfFonts).some((k) => k.endsWith('.ttf'))
  ) {
    // pdfmake 0.3.x — el módulo en sí ES el vfs (keys: "Roboto-*.ttf")
    vfs = pdfFonts;
  }

  if (!vfs || Object.keys(vfs).length === 0) {
    console.error('[pdfmake] no se encontró vfs:', pdfFontsModule);
    throw new Error('VFS de pdfmake no cargó. Sin fuentes pdfmake se cuelga.');
  }

  // pdfmake 0.3.x prefiere addVirtualFileSystem; 0.2.x usa pdfMake.vfs.
  if (typeof pdfMake.addVirtualFileSystem === 'function') {
    pdfMake.addVirtualFileSystem(vfs);
  } else {
    pdfMake.vfs = vfs;
  }
  console.log(
    '[pdfmake] vfs OK — fuentes:',
    Object.keys(vfs).filter((k) => k.endsWith('.ttf')).length
  );
  return pdfMake;
}

// ──────────────────────────────────────────────────────────────────
// Bloques del docDefinition
// ──────────────────────────────────────────────────────────────────

// Sellos laterales rotados -90° (lectura bottom-to-top, como en el
// certificado original). Usamos SVG con <text transform="rotate(-90)">.
function svgVerticalLabel(text, height = 180) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="${height}"><g transform="translate(11, ${height - 4}) rotate(-90)"><text x="0" y="0" font-size="8" fill="#1b70a2">${text}</text></g></svg>`;
}

function franjaLateral() {
  return [
    {
      svg: svgVerticalLabel('RA N° 142 – 2018-DSAIA – DIRIS L.N', 200),
      absolutePosition: { x: 22, y: 10 },
    },
    {
      svg: svgVerticalLabel('R.M. N° 449-2001 S.A.', 130),
      absolutePosition: { x: 22, y: 220 },
    },
    {
      svg: svgVerticalLabel('D.S. N° 022-2001 S.A.', 130),
      absolutePosition: { x: 22, y: 360 },
    },
  ];
}

function formatearNumero(n) {
  return String(n).padStart(6, '0');
}

function cabecera(numero, logoBase64) {
  const logoCol = logoBase64
    ? {
        width: 'auto',
        image: logoBase64,
        fit: [170, 70],
      }
    : {
        // Fallback en texto si el logo no se pudo cargar.
        width: 'auto',
        stack: [
          {
            text: 'BIOHAZARD',
            fontSize: 22,
            bold: true,
            color: '#1c4940',
            characterSpacing: 1,
          },
          {
            text: 'CIENCIA E INGENIERÍA EN',
            fontSize: 6.5,
            color: '#1c4940',
            characterSpacing: 1.5,
          },
          {
            text: 'SANEAMIENTO AMBIENTAL',
            fontSize: 6.5,
            color: '#1c4940',
            characterSpacing: 1.5,
          },
        ],
      };

  const companyInfo = {
    width: 'auto',
    alignment: 'left',
    stack: [
      { text: 'R.U.C.: 20603108605', fontSize: 10, bold: true },
      { text: 'BIOHAZARD E.I.R.L.', fontSize: 10, bold: true },
      {
        text: 'Los Sauces, Mz. B Lt. 3 – Puente Piedra',
        fontSize: 9,
        bold: true,
        color: '#1b70a2',
      },
      {
        text: 'Cel.: 944411064 – 944411504 - 932464561',
        fontSize: 9,
        bold: true,
        color: '#1b70a2',
      },
    ],
  };

  const numeroCol = numero
    ? {
        width: 'auto',
        text: `N° ${formatearNumero(numero)}`,
        fontSize: 14,
        bold: true,
        color: '#dc2626',
        characterSpacing: 1.5,
        margin: [14, 1, 0, 0],
      }
    : { width: 0, text: '' };

  return {
    columns: [logoCol, { width: '*', text: '' }, companyInfo, numeroCol],
    margin: [0, 0, 0, 12],
  };
}

function checkboxRow(label, marcado) {
  return {
    columns: [
      {
        width: 15,
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 2,
            w: 11,
            h: 11,
            lineWidth: 0.8,
            lineColor: '#1c4940',
          },
          ...(marcado
            ? [
              {
                type: 'line',
                x1: 1.5,
                y1: 8,
                x2: 4.5,
                y2: 11,
                lineWidth: 1.6,
                lineColor: '#399a7c',
              },
              {
                type: 'line',
                x1: 4.5,
                y1: 11,
                x2: 10,
                y2: 4,
                lineWidth: 1.6,
                lineColor: '#399a7c',
              },
            ]
            : []),
        ],
      },
      {
        width: '*',
        text: label,
        fontSize: 15,
        margin: [4, 0, 0, 0],
      },
    ],
    margin: [0, 0, 0, 10],
  };
}

function bloqueServicios(servicios = []) {
  const marcado = (s) => servicios.includes(s);
  return {
    columns: [
      {
        width: '*',
        stack: [
          checkboxRow('Desinsectación', marcado('Desinsectación')),
          checkboxRow('Desratización', marcado('Desratización')),
          checkboxRow('Desinfección', marcado('Desinfección')),
        ],
      },
      {
        width: '*',
        stack: [
          checkboxRow(
            'Limpieza y desinfección de reservorios de agua',
            marcado('Limpieza y desinfección de reservorios de agua')
          ),
          checkboxRow(
            'Limpieza de trampa de grasa',
            marcado('Limpieza de trampa de grasa')
          ),
          checkboxRow(
            'Otros',
            marcado('Otros')
          ),
        ],
      },
    ],
    margin: [40, 0, 40, 10],
  };
}

function celdaDato(label, valor) {
  const texto = String(valor || '').trim();
  // Truncar valores extremadamente largos (direcciones kilométricas)
  // para evitar que revienten el layout de una sola página.
  const txt = texto.length > 140 ? texto.slice(0, 137) + '...' : texto;

  let fontSize;
  if (txt.length > 70) fontSize = 7.5;
  else if (txt.length > 50) fontSize = 8.5;
  else if (txt.length > 30) fontSize = 9.5;
  else fontSize = 10.5;

  return {
    text: [
      { text: label, bold: true, fontSize },
      { text: ` ${txt}`, fontSize },
    ],
    lineHeight: 1.05,
    margin: [0, 1.5, 0, 0],
  };
}

function bloqueDatos(cert) {
  // Tabla de 2 columnas que alinea "Fecha de Vencimiento/Emisión"
  // exactamente con las dos últimas filas de la columna izquierda.
  return {
    table: {
      widths: ['*', '*'],
      body: [
        [celdaDato('A:', cert.cliente), ''],
        [celdaDato('Ubicado en:', cert.ubicacion), ''],
        [celdaDato('Giro:', cert.giro), ''],
        [
          celdaDato('Área tratada:', formatearArea(cert.areaTratada)),
          celdaDato(
            'Fecha de Vencimiento:',
            formatearFechaCorta(cert.fechaVencimiento)
          ),
        ],
        [
          celdaDato(
            'Fecha de servicio:',
            formatearFechaCorta(cert.fechaServicio)
          ),
          celdaDato(
            'Fecha de Emisión:',
            formatearFechaCorta(cert.fechaEmision)
          ),
        ],
      ],
    },
    layout: 'noBorders',
    margin: [90, 0, 0, 20],
  };
}

function bloqueFirmas(firmaDirector, firmaGerente) {
  function columna(imagen, titulo, esDirector = false) {
    const stack = [];
    if (imagen) {
      // OJO: nada de margen NEGATIVO. pdfmake puede entrar en bucle de
      // layout y colgarse. Si quieres que la firma "toque" la línea, ajusta
      // el alto del fit en lugar de usar negative margin.
      //
      // Caso especial SOLO para la firma del director técnico: se veía muy
      // chica, así que la ensanchamos (width) manteniendo el mismo alto (55).
      // El resto de firmas conservan el `fit: [120, 55]` original intacto.
      stack.push(
        esDirector
          ? {
              image: imagen,
              width: 120,
              height: 55,
              alignment: 'center',
              margin: [0, 0, 0, 0],
            }
          : {
              image: imagen,
              fit: [120, 55],
              alignment: 'center',
              margin: [0, 0, 0, 2],
            }
      );
    } else {
      stack.push({ text: '', margin: [0, 35, 0, 0] });
    }
    stack.push({
      canvas: [
        { type: 'line', x1: 85, y1: 5, x2: 305, y2: 5, lineWidth: 0.5 },
      ],
      margin: [0, 0, 0, 4],
    });
    stack.push({
      text: titulo,
      alignment: 'center',
      fontSize: 10,
      bold: true,
    });
    return { width: '50%', stack };
  }

  return {
    columns: [
      columna(firmaDirector, 'Director técnico', true),
      columna(firmaGerente, 'Gerente General'),
    ],
    margin: [0, 0, 0, 0],
  };
}

// ──────────────────────────────────────────────────────────────────
// Documento completo
// ──────────────────────────────────────────────────────────────────

function construirDocDefinition(cert, assets = {}) {
  const { logoBase64, firmaDirector, firmaGerente, qrDataUrl } = assets;

  return {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [55, 28, 35, 28],
    // Borde azul + marca de agua del logo (centrada, opacity baja).
    background: function (_currentPage, pageSize) {
      const items = [
        {
          canvas: [
            {
              type: 'rect',
              x: 15,
              y: 15,
              w: pageSize.width - 30,
              h: pageSize.height - 30,
              lineWidth: 1.8,
              lineColor: '#1b70a2',
            },
          ],
        },
      ];
      if (logoBase64) {
        const wmWidth = 480;
        items.push({
          image: logoBase64,
          width: wmWidth,
          opacity: 0.08,
          absolutePosition: {
            x: (pageSize.width - wmWidth) / 2,
            y: (pageSize.height - 230) / 2,
          },
        });
      }
      return items;
    },
    content: [
      cabecera(cert.numero, logoBase64),
      ...franjaLateral(),
      {
        text: 'CERTIFICADO',
        fontSize: 75,
        bold: true,
        alignment: 'center',
        characterSpacing: 4,
        margin: [0, 5, 0, 28],
      },
      {
        text: 'Por el presente certificamos que se han realizado los servicios de saneamiento ambiental correspondiente a:',
        fontSize: 10.5,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 22],
      },
      bloqueServicios(cert.servicios),
      bloqueDatos(cert),
      bloqueFirmas(firmaDirector, firmaGerente),
      // QR arriba al centro (entre el logo y los datos de la empresa).
      // Apunta al endpoint estable /api/tareas/:id/pdf que redirige al
      // pdfUrl vigente, así el QR sigue funcionando aunque el cert se
      // edite en el futuro.
      ...(qrDataUrl
        ? [
            {
              image: qrDataUrl,
              width: 60,
              absolutePosition: { x: 400, y: 22 },
            },
          ]
        : []),
    ],
    defaultStyle: { fontSize: 10, color: '#000' },
  };
}

// ──────────────────────────────────────────────────────────────────
// API pública
// ──────────────────────────────────────────────────────────────────

// Flag para activar/desactivar las imágenes embebidas (logo + firmas).
// Ahora que el vfs carga correctamente, las imágenes deberían entrar sin
// colgar pdfmake. Si volviera a colgarse, baja a false para diagnosticar.
const INCLUIR_IMAGENES = true;

export async function generarCertificadoPdf(cert) {
  console.log('[PDF] cert recibido:', cert);

  const pdfMake = await cargarPdfMake();

  let logoBase64 = null;
  let firmaDirector = null;
  let firmaGerente = null;

  if (INCLUIR_IMAGENES) {
    console.log('[PDF] cargando assets de /public…');
    const [logoRaw, firmaDirRaw, firmaGerRaw] = await Promise.all([
      getBase64FromPublic('/logobiohazard.jpeg'),
      // getBase64FromPublic('/firmeDirector.jpeg'),
      getBase64FromPublic('/firmadirectecnicobiohazard.jpeg'),
      getBase64FromPublic('/firmaGerente.jpeg'),
    ]);

    console.log('[PDF] normalizando assets a JPEG (vía canvas)…');
    [logoBase64, firmaDirector, firmaGerente] = await Promise.all([
      normalizarImagen(logoRaw, 280),
      normalizarImagen(firmaDirRaw, 220),
      normalizarImagen(firmaGerRaw, 220),
    ]);
    console.log('[PDF] assets listos:', {
      logo: !!logoBase64,
      firmaDirector: !!firmaDirector,
      firmaGerente: !!firmaGerente,
    });
  } else {
    console.warn(
      '[PDF] ⚠️ INCLUIR_IMAGENES=false — generando sin logo/firmas. ' +
        'Cuando confirmes que pdfmake funciona así, cambia el flag arriba a true.'
    );
  }

  // QR del cert (URL estable que redirige al pdfUrl actual).
  console.log('[PDF] generando QR…');
  const qrDataUrl = await generarQrDataUrl(cert._id);
  console.log('[PDF] QR listo:', !!qrDataUrl);

  const docDefinition = construirDocDefinition(cert, {
    logoBase64,
    firmaDirector,
    firmaGerente,
    qrDataUrl,
  });

  // Devuelve el generador. El llamador decide qué hacer:
  //   - pdfDocGenerator.getBlob(cb)     → Blob (para subir)
  //   - pdfDocGenerator.open()          → abrir en nueva pestaña
  return pdfMake.createPdf(docDefinition);
}
