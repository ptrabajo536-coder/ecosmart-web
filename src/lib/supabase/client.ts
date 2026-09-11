import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para usar en componentes del navegador ("use client").
 * Usa la clave pública (anon key) — es segura de exponer, la seguridad real
 * la da Row Level Security (RLS) en la base de datos (ver supabase/schema.sql).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
