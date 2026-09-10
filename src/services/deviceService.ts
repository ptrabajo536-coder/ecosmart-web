/**
 * deviceService
 * --------------
 * Única capa autorizada para "hablar" con el dispositivo físico.
 *
 * Ni el frontend web, ni la app Android, ni las rutas de la API deben saber
 * CÓMO se enciende o apaga el relé. Solo conocen estas funciones:
 *
 *   - turnOnRelay(userId)
 *   - turnOffRelay(userId)
 *   - getRelayState()
 *   - getDeviceStatus()
 *
 * El estado del relé es UN SOLO RECURSO COMPARTIDO por todo el salón: si un
 * estudiante lo enciende, todos los demás (web y Android) deben ver ese
 * mismo estado. Por eso vive en Postgres (tabla `relay_state`, fila única) y
 * no en memoria del proceso.
 *
 * IMPORTANTE sobre DEVICE_MODE=real: escribir en esta tabla es TODO lo que
 * el backend necesita hacer. El ESP32 (construido por el estudiante) no
 * recibe órdenes directas del backend — en vez de eso, consulta
 * /api/device/relay-state cada pocos segundos y aplica el estado que
 * encuentra aquí. Esto es lo que permite controlar el bombillo desde
 * cualquier red, no solo la misma WiFi: el ESP32 siempre inicia la conexión
 * hacia afuera, nunca al revés. Por eso turnOnRelay/turnOffRelay hacen
 * exactamente lo mismo en "simulation" y en "real" — la diferencia es si
 * hay o no un ESP32 real consultando y aplicando ese estado.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { DeviceMode, RelayState } from "@/types/lights";

export function getDeviceMode(): DeviceMode {
  const mode = process.env.DEVICE_MODE;
  return mode === "real" ? "real" : "simulation";
}

interface RelayRow {
  state: RelayState;
  updated_at: string;
}

async function readRelayRow(): Promise<RelayRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("relay_state")
    .select("state, updated_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error(
      "No fue posible leer el estado del relé en la base de datos. " +
        "Verifica que ejecutaste supabase/schema.sql en tu proyecto de Supabase."
    );
  }

  return data as RelayRow;
}

async function writeRelayRow(
  state: RelayState,
  userId: string
): Promise<RelayRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("relay_state")
    .update({ state, updated_at: new Date().toISOString(), updated_by: userId })
    .eq("id", 1)
    .select("state, updated_at")
    .single();

  if (error || !data) {
    throw new Error("No fue posible actualizar el estado del relé.");
  }

  return data as RelayRow;
}

/**
 * Enciende el relé (las 6 luces lógicas). Guarda la intención en la base de
 * datos — el ESP32 la aplica al consultar /api/device/relay-state.
 */
export async function turnOnRelay(userId: string): Promise<RelayState> {
  const row = await writeRelayRow("ON", userId);
  return row.state;
}

/**
 * Apaga el relé (las 6 luces lógicas). Misma idea que turnOnRelay.
 */
export async function turnOffRelay(userId: string): Promise<RelayState> {
  const row = await writeRelayRow("OFF", userId);
  return row.state;
}

/**
 * Devuelve el estado actual del relé sin modificarlo.
 */
export async function getRelayState(): Promise<RelayState> {
  const row = await readRelayRow();
  return row.state;
}

/**
 * Devuelve un snapshot completo del estado del dispositivo:
 * modo, estado del relé y última actualización.
 */
export async function getDeviceStatus(): Promise<{
  mode: DeviceMode;
  relayState: RelayState;
  updatedAt: string;
}> {
  const row = await readRelayRow();
  return {
    mode: getDeviceMode(),
    relayState: row.state,
    updatedAt: row.updated_at,
  };
}
