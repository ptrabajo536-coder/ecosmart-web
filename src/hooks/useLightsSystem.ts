"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ApiErrorResponse,
  HistoryEntry,
  HistoryResponse,
  LightsStatusResponse,
  RelayAction,
} from "@/types/lights";

type ConnectionState = "connecting" | "connected" | "disconnected";
type CommandState = "idle" | "sending" | "error";

interface UseLightsSystemResult {
  status: LightsStatusResponse | null;
  history: HistoryEntry[];
  connection: ConnectionState;
  command: CommandState;
  message: string | null;
  sendAction: (action: RelayAction) => Promise<void>;
}

function isErrorResponse(body: unknown): body is ApiErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    (body as { success: unknown }).success === false
  );
}

/**
 * Hook que controla el panel de UN salón específico. Cada salón tiene su
 * propio estado, historial y ESP32 -- por eso todo aquí está parametrizado
 * por roomId.
 */
export function useLightsSystem(roomId: string): UseLightsSystemResult {
  const [status, setStatus] = useState<LightsStatusResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [command, setCommand] = useState<CommandState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/history`, { cache: "no-store" });
      const body: HistoryResponse | ApiErrorResponse = await res.json();
      if (isErrorResponse(body)) return;
      setHistory(body.history);
    } catch {
      // El historial es secundario: si falla, no rompemos el panel principal.
    }
  }, [roomId]);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/lights`, { cache: "no-store" });
      const body: LightsStatusResponse | ApiErrorResponse = await res.json();

      if (isErrorResponse(body)) {
        setConnection("disconnected");
        setMessage(body.error);
        return;
      }

      setStatus(body);
      setConnection("connected");
    } catch {
      setConnection("disconnected");
      setMessage("No fue posible comunicarse con el servidor.");
    }
  }, [roomId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial al montar
    refreshStatus();
    refreshHistory();
  }, [refreshStatus, refreshHistory]);

  const sendAction = useCallback(
    async (action: RelayAction) => {
      setCommand("sending");
      setMessage(action === "ON" ? "Encendiendo luces..." : "Apagando luces...");

      try {
        const res = await fetch(`/api/rooms/${roomId}/lights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const body: LightsStatusResponse | ApiErrorResponse = await res.json();

        if (isErrorResponse(body)) {
          setCommand("error");
          setConnection("disconnected");
          setMessage(body.error);
          return;
        }

        setStatus(body);
        setConnection("connected");
        setCommand("idle");
        setMessage(
          action === "ON"
            ? "Luces encendidas correctamente."
            : "Luces apagadas correctamente."
        );
        refreshHistory();
      } catch {
        setCommand("error");
        setConnection("disconnected");
        setMessage("No fue posible comunicarse con el servidor.");
      }
    },
    [roomId, refreshHistory]
  );

  return { status, history, connection, command, message, sendAction };
}
