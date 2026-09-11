import type { NextRequest } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Identifica al usuario autenticado de una petición a la API, sin importar
 * si viene del navegador (sesión por cookies) o de la app Android (token
 * Bearer en el header Authorization).
 *
 * - Web (Next.js): el navegador manda las cookies de Supabase automáticamente.
 * - Android (Expo): no hay cookies entre apps nativas y un dominio HTTPS
 *   distinto, así que la app manda el access_token de su sesión de Supabase
 *   en el header `Authorization: Bearer <token>`.
 *
 * Devuelve null si no hay una sesión válida por ninguno de los dos caminos.
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  // 1. Intento por cookie (web)
  const cookieClient = await createCookieClient();
  const { data: cookieData } = await cookieClient.auth.getUser();
  if (cookieData.user?.email) {
    return { id: cookieData.user.id, email: cookieData.user.email };
  }

  // 2. Intento por Bearer token (Android / cualquier cliente nativo)
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) return null;

  const tokenClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: tokenData, error } = await tokenClient.auth.getUser(token);

  if (error || !tokenData.user?.email) return null;

  return { id: tokenData.user.id, email: tokenData.user.email };
}
