import { NextRequest, NextResponse } from "next/server";
import { turnOnRelay, turnOffRelay } from "@/services/deviceService";
import { addHistoryEntry } from "@/services/historyService";
import { buildLightsStatus } from "@/lib/buildLightsStatus";
import { authenticateRequest } from "@/lib/supabase/authenticateRequest";
import { withCors, corsPreflightResponse } from "@/lib/cors";
import type { ApiErrorResponse, LightsActionRequest } from "@/types/lights";

export const dynamic = "force-dynamic";

function unauthorized(): NextResponse<ApiErrorResponse> {
  return withCors(
    NextResponse.json<ApiErrorResponse>(
      { success: false, error: "Debes iniciar sesión para usar el sistema." },
      { status: 401 }
    )
  );
}

export async function OPTIONS() {
  return corsPreflightResponse();
}

type RouteParams = { params: Promise<{ roomId: string }> };

/**
 * GET /api/rooms/:roomId/lights
 * Estado actual del salón indicado (relé, 6 luces, consumo estimado).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();

  const { roomId } = await params;

  try {
    const status = await buildLightsStatus(roomId);
    return withCors(NextResponse.json(status, { status: 200 }));
  } catch (error) {
    console.error(`[GET /api/rooms/${roomId}/lights] error:`, error);
    const body: ApiErrorResponse = {
      success: false,
      error: "No fue posible obtener el estado de este salón.",
    };
    return withCors(NextResponse.json(body, { status: 500 }));
  }
}

/**
 * POST /api/rooms/:roomId/lights
 * Body: { "action": "ON" | "OFF" }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await authenticateRequest(request);
  if (!user || !user.email) return unauthorized();

  const { roomId } = await params;

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
    console.error(`[POST /api/rooms/${roomId}/lights] error:`, error);
    const body: ApiErrorResponse = {
      success: false,
      error: "No fue posible comunicarse con el dispositivo de este salón.",
    };
    return withCors(NextResponse.json(body, { status: 500 }));
  }
}
