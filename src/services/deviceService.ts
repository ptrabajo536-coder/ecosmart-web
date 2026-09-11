/**
 * deviceService
 * --------------
 * Única capa autorizada para "hablar" con el dispositivo físico de cada
 * salón. Cada salón (rooms.id, ej. "salon-a") tiene su propio ESP32 y relé,
 * completamente independientes entre sí.
 *
 *   - turnOnRelay(roomId, userId)
 *   - turnOffRelay(roomId, userId)
 *   - getRelayState(roomId)
 *   - getDeviceStatus(roomId)
 *
 * El estado de cada salón vive en Postgres (tabla `rooms`, una fila por
 * salón). Escribir en esta tabla es todo lo que el backend necesita hacer:
 * cada ESP32 consulta /api/device/relay-state?room=<roomId> y aplica el
 * estado que encuentra ahí — ver la Sección 2.1 de la documentación técnica.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { DeviceMode, RelayState, Room } from "@/types/lights";

export function getDeviceMode(): DeviceMode {
  const mode = process.env.DEVICE_MODE;
  return mode === "real" ? "real" : "simulation";
}

interface RoomRow {
  id: string;
  name: string;
  state: RelayState;
  updated_at: string;
}

export async function listRooms(): Promise<Room[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name")
    .order("id", { ascending: true });

  if (error || !data) {
    throw new Error("No fue posible leer la lista de salones.");
  }

  return data;
}

export async function listRoomsWithState(): Promise<
  (Room & { state: RelayState; updatedAt: string })[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, state, updated_at")
    .order("id", { ascending: true });

  if (error || !data) {
    throw new Error("No fue posible leer la lista de salones.");
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    state: row.state as RelayState,
    updatedAt: row.updated_at,
  }));
}

async function readRoomRow(roomId: string): Promise<RoomRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, state, updated_at")
    .eq("id", roomId)
    .single();

  if (error || !data) {
    throw new Error(`No existe el salón "${roomId}" o no fue posible leerlo.`);
  }

  return data as RoomRow;
}

async function writeRoomRow(
  roomId: string,
  state: RelayState,
  userId: string
): Promise<RoomRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .update({ state, updated_at: new Date().toISOString(), updated_by: userId })
    .eq("id", roomId)
    .select("id, name, state, updated_at")
    .single();

  if (error || !data) {
    throw new Error(`No fue posible actualizar el estado del salón "${roomId}".`);
  }

  return data as RoomRow;
}

export async function turnOnRelay(roomId: string, userId: string): Promise<RelayState> {
  const row = await writeRoomRow(roomId, "ON", userId);
  return row.state;
}

export async function turnOffRelay(roomId: string, userId: string): Promise<RelayState> {
  const row = await writeRoomRow(roomId, "OFF", userId);
  return row.state;
}

export async function getRelayState(roomId: string): Promise<RelayState> {
  const row = await readRoomRow(roomId);
  return row.state;
}

export async function getDeviceStatus(roomId: string): Promise<{
  mode: DeviceMode;
  relayState: RelayState;
  updatedAt: string;
  roomName: string;
}> {
  const row = await readRoomRow(roomId);
  return {
    mode: getDeviceMode(),
    relayState: row.state,
    updatedAt: row.updated_at,
    roomName: row.name,
  };
}
