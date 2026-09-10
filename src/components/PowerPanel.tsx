"use client";

import type { LightsStatusResponse, RelayAction } from "@/types/lights";

interface PowerPanelProps {
  status: LightsStatusResponse | null;
  sending: boolean;
  onAction: (action: RelayAction) => void;
}

export function PowerPanel({ status, sending, onAction }: PowerPanelProps) {
  const relayOn = status?.relay.state === "ON";

  return (
    <section className="grid gap-6 border-b border-[var(--eco-border)] px-6 py-8 md:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-[11px] tracking-wide text-[var(--eco-text-muted)]">
          RELÉ PRINCIPAL
        </span>

        <button
          type="button"
          disabled={sending}
          onClick={() => onAction(relayOn ? "OFF" : "ON")}
          aria-pressed={relayOn}
          className="group relative flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-md border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor: relayOn ? "var(--eco-on)" : "var(--eco-border)",
            background: relayOn ? "var(--eco-on-dim)" : "var(--eco-surface)",
          }}
        >
          <span
            className="font-mono text-2xl font-semibold"
            style={{ color: relayOn ? "var(--eco-on)" : "var(--eco-text-muted)" }}
          >
            {sending ? "···" : relayOn ? "ON" : "OFF"}
          </span>
          <span className="text-[11px] text-[var(--eco-text-muted)]">
            {sending ? "procesando" : "toca para cambiar"}
          </span>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={sending || relayOn}
            onClick={() => onAction("ON")}
            className="rounded border border-[var(--eco-border)] px-3 py-1.5 text-xs font-medium text-[var(--eco-text)] transition-colors hover:border-[var(--eco-on)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Encender todas
          </button>
          <button
            type="button"
            disabled={sending || !relayOn}
            onClick={() => onAction("OFF")}
            className="rounded border border-[var(--eco-border)] px-3 py-1.5 text-xs font-medium text-[var(--eco-text)] transition-colors hover:border-[var(--eco-warn)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Apagar todas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[var(--eco-border)] bg-[var(--eco-border)] self-start">
        <Reading
          label="luces encendidas"
          value={status ? `${status.lights.on}` : "—"}
          suffix={`/ ${status?.lights.total ?? 6}`}
        />
        <Reading
          label="consumo estimado"
          value={status ? `${status.power.watts}` : "—"}
          suffix="W"
        />
        <Reading
          label="estado general"
          value={relayOn ? "activo" : "en reposo"}
        />
      </div>
    </section>
  );
}

function Reading({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="bg-[var(--eco-surface)] px-4 py-3">
      <div className="font-mono text-[11px] text-[var(--eco-text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-medium">
        {value}
        {suffix && (
          <span className="ml-1 text-sm text-[var(--eco-text-muted)]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
