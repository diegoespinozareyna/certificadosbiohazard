import { redirect } from 'next/navigation';

// La home redirige directamente a /tareas (no existe la "/" como página).
// Server-side redirect: no se renderiza nada antes, no hay flash.
export default function Home() {
  redirect('/tareas');
}
