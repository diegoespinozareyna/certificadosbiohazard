'use client';

const TOKEN_KEY = 'biohazard_token';
const USER_KEY = 'biohazard_user';
const EVENT = 'biohazard:auth-change';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || 'Error al iniciar sesión');
  }
  localStorage.setItem(TOKEN_KEY, json.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(json.data.user));
  // Notifica a otros componentes en la misma pestaña
  window.dispatchEvent(new Event(EVENT));
  return json.data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export const AUTH_EVENT = EVENT;
