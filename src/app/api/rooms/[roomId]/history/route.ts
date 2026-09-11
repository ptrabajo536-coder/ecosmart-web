import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/services/historyService";
import { authenticateRequest } from "@/lib/supabase/authenticateRequest";
import { withCors, corsPreflightResponse } from "@/lib/cors";
import type { ApiErrorResponse, HistoryResponse } from "@/types/lights";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsPreflightResponse();
}

type RouteParams = { params: Promise<{ roomId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await authenticateRequest(request);
  if (!user) {
    const body: ApiErrorResponse = {
      success: false,
      error: "Debes iniciar sesión para usar el sistema.",
    };
    return withCors(NextResponse.json(body, { status: 401 }));
  }

  const { roomId } = await params;

  try {
    const history = await getHistory(roomId);
    const body: HistoryResponse = { success: true, history };
    return withCors(NextResponse.json(body, { status: 200 }));
  } catch (error) {
    console.error(`[GET /api/rooms/${roomId}/history] error:`, error);
    const body: ApiErrorResponse = {
      success: false,
      error: "No fue posible obtener el historial de este salón.",
    };
    return withCors(NextResponse.json(body, { status: 500 }));
  }
}
