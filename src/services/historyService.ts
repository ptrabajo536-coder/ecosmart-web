/**
 * historyService
 * --------------
 * Guarda las últimas acciones ejecutadas ("Últimas acciones"), incluyendo
 * QUIÉN las ejecutó. Persiste en Postgres (tabla `light_actions`) porque
 * ahora hay varios estudiantes usando el sistema desde distintos
 * dispositivos: el historial debe ser el mismo para todos.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { HistoryEntry, RelayAction } from "@/types/lights";

const MAX_ENTRIES = 20;

export async function addHistoryEntry(
  action: RelayAction,
  userId: string,
  userEmail: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("light_actions").insert({
    action,
    user_id: userId,
    user_email: userEmail,
  });

  if (error) {
    // El historial es secundario: si falla, no debe tumbar la acción principal
    // de encender/apagar, que ya se aplicó. Solo lo dejamos registrado.
    console.error("[historyService.addHistoryEntry] error:", error.message);
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("light_actions")
    .select("id, action, user_email, created_at")
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
