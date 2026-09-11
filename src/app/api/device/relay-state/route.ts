import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/device/relay-state?room=salon-a
 *
 * Cada ESP32 consulta esta ruta indicando SU salón (?room=...) y su propia
 * clave secreta en el header X-Device-Key. Cada salón tiene su propia clave
 * (variables de entorno DEVICE_API_KEY_<ROOM_ID>), así un ESP32 nunca puede
 * leer ni afectar el estado de un salón que no es el suyo.
 *
 * Ejemplo: para roomId "salon-a", la variable esperada es
 * DEVICE_API_KEY_SALON_A. Para "salon-b", DEVICE_API_KEY_SALON_B.
 */
function envKeyFor(roomId: string): string {
  const normalized = roomId.toUpperCase().replace(/-/g, "_");
  return `DEVICE_API_KEY_${normalized}`;
}

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("room");

  if (!roomId) {
    return NextResponse.json(
      { success: false, error: 'Falta el parámetro "room" en la URL.' },
      { status: 400 }
    );
  }

  const deviceKey = request.headers.get("x-device-key");
  const expectedKey = process.env[envKeyFor(roomId)];

  if (!expectedKey) {
    console.error(
      `[GET /api/device/relay-state] No existe la variable ${envKeyFor(roomId)} o el salón "${roomId}" no está configurado.`
    );
    return NextResponse.json(
      { success: false, error: "Este salón no está configurado en el servidor." },
      { status: 500 }
    );
  }

  if (!deviceKey || deviceKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: "Clave de dispositivo inválida para este salón." },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("state, updated_at")
    .eq("id", roomId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: `No fue posible leer el estado del salón "${roomId}".` },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, state: data.state, updatedAt: data.updated_at },
    { status: 200 }
  );
}
