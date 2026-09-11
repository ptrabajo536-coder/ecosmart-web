"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";
import type { ApiErrorResponse, RoomsListResponse } from "@/types/lights";

interface RoomSelectorProps {
  userEmail: string;
}

function isErrorResponse(body: unknown): body is ApiErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    (body as { success: unknown }).success === false
  );
}

export function RoomSelector({ userEmail }: RoomSelectorProps) {
  const [rooms, setRooms] = useState<RoomsListResponse["rooms"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/rooms", { cache: "no-store" });
        const body: RoomsListResponse | ApiErrorResponse = await res.json();
        if (cancelled) return;

        if (isErrorResponse(body)) {
          setError(body.error);
          return;
        }
        setRooms(body.rooms);
      } catch {
        if (!cancelled) setError("No fue posible comunicarse con el servidor.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--eco-border)] px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">ECOsmart</span>
          <span className="font-mono text-xs text-[var(--eco-text-muted)]">
            elige un salón
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--eco-text-muted)]">
          {userEmail}
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-[var(--eco-text)] underline hover:text-[var(--eco-warn)]"
            >
              salir
            </button>
          </form>
        </div>
      </div>

      <div className="px-6 py-8">
        {error && (
          <p className="mb-4 font-mono text-xs text-[var(--eco-warn)]">{error}</p>
        )}

        {!rooms && !error && (
          <p className="font-mono text-xs text-[var(--eco-text-muted)]">Cargando salones...</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rooms?.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="flex flex-col gap-3 rounded-md border border-[var(--eco-border)] bg-[var(--eco-surface)] px-5 py-5 transition-colors hover:border-[var(--eco-on)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">{room.name}</span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: room.state === "ON" ? "var(--eco-on)" : "var(--eco-off)",
                  }}
                  aria-hidden
                />
              </div>
              <span className="font-mono text-xs text-[var(--eco-text-muted)]">
                {room.state === "ON" ? "encendido" : "apagado"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
