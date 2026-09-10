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

export function useLightsSystem(): UseLightsSystemResult {
  const [status, setStatus] = useState<LightsStatusResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [command, setCommand] = useState<CommandState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      const body: HistoryResponse | ApiErrorResponse = await res.json();
      if (isErrorResponse(body)) return;
      setHistory(body.history);
    } catch {
      // El historial es secundario: si falla, no rompemos el panel principal.
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/lights", { cache: "no-store" });
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
  }, []);

  useEffect(() => {
    // Carga inicial de datos remotos al montar el panel. setState ocurre
    // dentro de los callbacks async (después del await), no de forma
    // síncrona en el cuerpo del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial al montar
    refreshStatus();
    refreshHistory();
  }, [refreshStatus, refreshHistory]);

  const sendAction = useCallback(
    async (action: RelayAction) => {
      setCommand("sending");
      setMessage(action === "ON" ? "Encendiendo luces..." : "Apagando luces...");

      try {
        const res = await fetch("/api/lights", {
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
    [refreshHistory]
  );

  return { status, history, connection, command, message, sendAction };
}
