import { NextResponse } from "next/server";
import { listRoomsWithState } from "@/services/deviceService";
import { authenticateRequest } from "@/lib/supabase/authenticateRequest";
import { withCors, corsPreflightResponse } from "@/lib/cors";
import type { ApiErrorResponse, RoomsListResponse } from "@/types/lights";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflightResponse();
}

/**
 * GET /api/rooms
 * Devuelve todos los salones y su estado actual, para la pantalla donde
 * el estudiante elige cuál salón controlar.
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

  try {
    const rooms = await listRoomsWithState();
    const body: RoomsListResponse = { success: true, rooms };
    return withCors(NextResponse.json(body, { status: 200 }));
  } catch (error) {
    console.error("[GET /api/rooms] error:", error);
    const body: ApiErrorResponse = {
      success: false,
      error: "No fue posible obtener la lista de salones.",
    };
    return withCors(NextResponse.json(body, { status: 500 }));
  }
}
