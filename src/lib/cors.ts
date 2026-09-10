import { NextResponse } from "next/server";

/**
 * La app Android no es una página web con el mismo origen que el backend,
 * así que el navegador embebido / cliente HTTP nativo necesita headers CORS
 * explícitos para poder llamar /api/lights y /api/history.
 *
 * No se restringe por dominio porque una app nativa no tiene "origen" HTTP
 * real que filtrar (a diferencia de un sitio web de terceros); el control de
 * acceso real lo da la sesión (ver authenticateRequest.ts), no CORS.
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function withCors<T>(response: NextResponse<T>): NextResponse<T> {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function corsPreflightResponse(): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }));
}
