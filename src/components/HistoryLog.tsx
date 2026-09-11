import type { HistoryEntry } from "@/types/lights";

interface HistoryLogProps {
  entries: HistoryEntry[];
}

export function HistoryLog({ entries }: HistoryLogProps) {
  return (
    <section className="history-log px-6 py-8">
      <h2 className="mb-4 flex items-center justify-between text-[15px] font-semibold text-[var(--eco-text)]">
        Historial reciente
        <span className="history-count">{entries.length}</span>
      </h2>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--eco-text-muted)]">
          Todavía no se ha registrado ninguna acción.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--eco-border)] rounded-md border border-[var(--eco-border)]">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs"
            >
              <span className="text-[var(--eco-text-muted)]">
                {new Date(entry.timestamp).toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span
                style={{
                  color:
                    entry.action === "ON"
                      ? "var(--eco-on)"
                      : "var(--eco-text-muted)",
                }}
              >
                {entry.userEmail} {entry.action === "ON" ? "encendió" : "apagó"} el sistema
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
