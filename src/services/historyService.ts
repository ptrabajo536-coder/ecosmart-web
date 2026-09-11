/**
 * historyService
 * --------------
 * Historial de acciones, ahora con el salón al que pertenece cada una
 * (columna room_id en light_actions), para que el historial de un salón
 * no se mezcle con el de otro.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { HistoryEntry, RelayAction } from "@/types/lights";

const MAX_ENTRIES = 20;

export async function addHistoryEntry(
  action: RelayAction,
  userId: string,
  userEmail: string,
  roomId: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("light_actions").insert({
    action,
    user_id: userId,
    user_email: userEmail,
    room_id: roomId,
  });

  if (error) {
    console.error("[historyService.addHistoryEntry] error:", error.message);
  }
}

export async function getHistory(roomId: string): Promise<HistoryEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("light_actions")
    .select("id, action, user_email, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(MAX_ENTRIES);

  if (error || !data) {
    console.error("[historyService.getHistory] error:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    action: row.action as RelayAction,
    timestamp: row.created_at,
    userEmail: row.user_email,
  }));
}
