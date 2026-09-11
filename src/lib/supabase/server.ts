import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para usar en el servidor: Route Handlers (src/app/api/*),
 * Server Components y Server Actions. Lee/escribe la sesión desde las cookies
 * de la petición actual, por eso es async.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ocurre si se llama desde un Server Component (sin permiso de
            // escritura). El middleware ya se encarga de refrescar la sesión
            // en ese caso, así que es seguro ignorarlo.
          }
        },
      },
    }
  );
}
