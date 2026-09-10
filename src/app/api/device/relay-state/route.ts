import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/device/relay-state
 *
 * Endpoint que consulta el ESP32 (no un usuario ni el frontend). No usa
 * sesión de Supabase Auth -- un microcontrolador no "inicia sesión" -- sino
 * una clave compartida simple en el header `X-Device-Key`, comparada contra
 * DEVICE_API_KEY. Es intencionalmente distinto de /api/lights: ese endpoint
 * es para personas (con su propia cuenta), este es para EL dispositivo.
 *
 * Devuelve solo lo mínimo que el ESP32 necesita: el estado deseado del
 * relé. El ESP32 compara esto contra lo que tiene físicamente aplicado y
 * mueve el pin del relé si hay diferencia.
 */
export async function GET(request: NextRequest) {
  const deviceKey = request.headers.get("x-device-key");
  const expectedKey = process.env.DEVICE_API_KEY;

  if (!expectedKey) {
    console.error("[GET /api/device/relay-state] DEVICE_API_KEY no está configurada");
    return NextResponse.json(
      { success: false, error: "Dispositivo no configurado en el servidor." },
      { status: 500 }
    );
  }

  if (!deviceKey || deviceKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: "Clave de dispositivo inválida." },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("relay_state")
    .select("state, updated_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "No fue posible leer el estado del relé." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, state: data.state, updatedAt: data.updated_at },
    { status: 200 }
  );
}
