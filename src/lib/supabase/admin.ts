import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con privilegios de administrador (service_role key).
 *
 * SOLO se usa en rutas de servidor que YA validaron el acceso por otro medio
 * (aquí: la clave del dispositivo, ver /api/device/relay-state). Este
 * cliente ignora Row Level Security por completo, así que nunca debe
 * importarse desde código que corra en el navegador o en la app Android.
 *
 * El ESP32 nunca ve esta clave — solo conoce la URL del backend y
 * DEVICE_API_KEY (ver .env.example). La service_role key vive únicamente
 * en las variables de entorno del servidor (Vercel / .env.local).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
