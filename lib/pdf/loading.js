'use client';

const ID = 'biohazard-pdf-loading';

export function mostrarLoadingPdf(texto = 'Generando certificado…') {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ID)) return;

  const el = document.createElement('div');
  el.id = ID;
  el.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.7);display:flex;justify-content:center;align-items:center;z-index:99999;flex-direction:column';
  el.innerHTML = `
    <div style="width:50px;height:50px;border:4px solid #dff5ee;border-top:4px solid #4eb495;border-radius:50%;animation:bh-spin 1s linear infinite"></div>
    <p style="margin-top:12px;font-weight:bold;color:#1c4940">${texto}</p>
    <style>@keyframes bh-spin{to{transform:rotate(360deg)}}</style>
  `;
  document.body.appendChild(el);
}

export function ocultarLoadingPdf() {
  if (typeof document === 'undefined') return;
  document.getElementById(ID)?.remove();
}
