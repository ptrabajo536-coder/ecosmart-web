import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/services/historyService";
import { authenticateRequest } from "@/lib/supabase/authenticateRequest";
import { withCors, corsPreflightResponse } from "@/lib/cors";
import type { ApiErrorResponse, HistoryResponse } from "@/types/lights";

export const dynamic = "force-dynamic";

/**
 * OPTIONS /api/history
 * Respuesta al preflight CORS que el cliente HTTP de Android envía antes
 * del GET real.
 */
export async function OPTIONS() {
  return corsPreflightResponse();
}

/**
 * GET /api/history
 * Devuelve las últimas acciones ejecutadas sobre el sistema. Requiere sesión
 * (cookie desde web, o Bearer token desde Android).
 */
export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (!user) {
    const body: ApiErrorResponse = {
      success: false,
      error: "Debes iniciar sesión para usar el sistema.",
    };
    return withCors(NextResponse.json(body, { status: 401 }));
  }

  const roomId = request.nextUrl.searchParams.get("room");
  if (!roomId) {
    const body: ApiErrorResponse = {
      success: false,
      error: 'El parámetro "room" es requerido.',
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }

  try {
    const history = await getHistory(roomId);
    const body: HistoryResponse = { success: true, history };
    return withCors(NextResponse.json(body, { status: 200 }));
  } catch (error) {
    console.error("[GET /api/history] error:", error);
    const body: ApiErrorResponse = {
      success: false,
      error: "No fue posible obtener el historial.",
    };
    return withCors(NextResponse.json(body, { status: 500 }));
  }
}
