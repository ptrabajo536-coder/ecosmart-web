import { NextRequest, NextResponse } from "next/server";
import { turnOnRelay, turnOffRelay } from "@/services/deviceService";
import { addHistoryEntry } from "@/services/historyService";
import { buildLightsStatus } from "@/lib/buildLightsStatus";
import { authenticateRequest } from "@/lib/supabase/authenticateRequest";
import { withCors, corsPreflightResponse } from "@/lib/cors";
import type { ApiErrorResponse, LightsActionRequest } from "@/types/lights";

// Las funciones serverless de Vercel no deben cachear esta ruta: el estado
// del relé cambia con cada acción y debe reflejarse siempre en tiempo real.
export const dynamic = "force-dynamic";

function unauthorized(): NextResponse<ApiErrorResponse> {
  return withCors(
    NextResponse.json<ApiErrorResponse>(
      { success: false, error: "Debes iniciar sesión para usar el sistema." },
      { status: 401 }
    )
  );
}

/**
 * OPTIONS /api/lights
 * Respuesta al preflight CORS que el cliente HTTP de Android envía antes
 * del GET/POST real.
 */
export async function OPTIONS() {
  return corsPreflightResponse();
}

/**
 * GET /api/lights
 * Devuelve el estado actual del sistema (relé, 6 luces, consumo estimado).
 * Requiere sesión (cookie desde web, o Bearer token desde Android).
 */
export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();

  const roomId = request.nextUrl.searchParams.get("room");
  if (!roomId) {
    const body: ApiErrorResponse = {
      success: false,
      error: 'El parámetro "room" es requerido.',
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }

  try {
    const status = await buildLightsStatus(roomId);
    return withCors(NextResponse.json(status, { status: 200 }));
  } catch (error) {
    console.error("[GET /api/lights] error:", error);
    const body: ApiErrorResponse = {
      success: false,
      error: "No fue posible obtener el estado del sistema.",
    };
    return withCors(NextResponse.json(body, { status: 500 }));
  }
}

/**
 * POST /api/lights
 * Body esperado: { "action": "ON" | "OFF" }
 * Requiere sesión. Aplica la acción sobre el deviceService y registra en el
 * historial quién la ejecutó.
 */
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();

  const roomId = request.nextUrl.searchParams.get("room");
  if (!roomId) {
    const body: ApiErrorResponse = {
      success: false,
      error: 'El parámetro "room" es requerido.',
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }

  let payload: LightsActionRequest;

  try {
    payload = await request.json();
  } catch {
    const body: ApiErrorResponse = {
      success: false,
      error: "El cuerpo de la solicitud debe ser JSON válido.",
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }

  const { action } = payload ?? {};

  if (action !== "ON" && action !== "OFF") {
    const body: ApiErrorResponse = {
      success: false,
      error: 'El campo "action" es requerido y debe ser "ON" u "OFF".',
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }

  try {
    if (action === "ON") {
      await turnOnRelay(roomId, user.id);
    } else {
      await turnOffRelay(roomId, user.id);
    }

    await addHistoryEntry(action, user.id, user.email, roomId);

    const status = await buildLightsStatus(roomId);
    return withCors(NextResponse.json(status, { status: 200 }));
  } catch (error) {
    console.error("[POST /api/lights] error:", error);
    const body: ApiErrorResponse = {
      success: false,
      error: "No fue posible comunicarse con el dispositivo.",
    };
    return withCors(NextResponse.json(body, { status: 500 }));
  }
}
