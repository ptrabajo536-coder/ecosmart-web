import Link from "next/link";
import type { DeviceMode } from "@/types/lights";
import { logoutAction } from "@/app/auth/actions";

interface StatusBarProps {
  roomName: string;
  mode: DeviceMode | null;
  connected: boolean;
  updatedAt: string | null;
  userEmail: string | null;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function StatusBar({ roomName, mode, connected, updatedAt, userEmail }: StatusBarProps) {
  return (
    <div className="status-bar flex flex-wrap items-center justify-between gap-3 border-b border-[var(--eco-border)] px-6 py-4">
      <div className="flex items-baseline gap-2">
        <Link
          href="/rooms"
          className="font-mono text-xs text-[var(--eco-text-muted)] underline hover:text-[var(--eco-text)]"
        >
          ← salones
        </Link>
        <span className="text-lg font-semibold tracking-tight">{roomName}</span>
        <span className="font-mono text-xs text-[var(--eco-text-muted)]">ECOsmart</span>
      </div>

      <div className="status-meta flex items-center gap-4 font-mono text-xs text-[var(--eco-text-muted)]">
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? "bg-[var(--eco-on)]" : "bg-[var(--eco-warn)]"
            }`}
            aria-hidden
          />
          {connected ? "conectado" : "desconectado"}
        </span>
        <span className="border-l border-[var(--eco-border)] pl-4">
          modo: {mode === "real" ? "dispositivo real" : "simulación"}
        </span>
        <span className="border-l border-[var(--eco-border)] pl-4">
          actualizado {formatTime(updatedAt)}
        </span>
        {userEmail && (
          <span className="flex items-center gap-2 border-l border-[var(--eco-border)] pl-4">
            {userEmail}
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[var(--eco-text)] underline hover:text-[var(--eco-warn)]"
              >
                salir
              </button>
            </form>
          </span>
        )}
      </div>
    </div>
  );
}
