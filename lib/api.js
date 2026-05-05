import { getToken } from './auth';

const BASE_URL = "https://api.certificadosbiohazard.com/api" || 'http://localhost:4000/api';

// Headers con Authorization si hay token (para endpoints protegidos).
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `Error ${res.status}`);
  }
  return json.data;
}

export const getTareas = (ruc) => {
  const query = ruc ? `?ruc=${encodeURIComponent(ruc)}` : '';
  return request(`/tareas${query}`);
};

export const getTarea = (id) => request(`/tareas/${id}`);

export const createTarea = (tarea) =>
  request('/tareas', { method: 'POST', body: JSON.stringify(tarea) });

export const updateTarea = (id, tarea) =>
  request(`/tareas/${id}`, { method: 'PUT', body: JSON.stringify(tarea) });

export const deleteTarea = (id) =>
  request(`/tareas/${id}`, { method: 'DELETE' });

export const solicitarUploadUrl = (filename, contentType, ruta) =>
  request('/upload/sign', {
    method: 'POST',
    body: JSON.stringify({ filename, contentType, ruta }),
  });
