import type { LightUnit } from "@/types/lights";

interface LightGridProps {
  lights: LightUnit[] | null;
}

export function LightGrid({ lights }: LightGridProps) {
  const items = lights ?? Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Luz ${i + 1}`,
    state: "OFF" as const,
    watts: 0,
  }));

  return (
    <section className="light-grid-section border-b border-[var(--eco-border)] px-6 py-8">
      <h2 className="section-title mb-4 font-mono text-[11px] tracking-wide text-[var(--eco-text-muted)]">
        LUCES DEL SALÓN
      </h2>
      <div className="light-grid grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--eco-border)] bg-[var(--eco-border)] sm:grid-cols-3 md:grid-cols-6">
        {items.map((light) => (
          <LightCard key={light.id} light={light} />
        ))}
      </div>
    </section>
  );
}

function LightCard({ light }: { light: LightUnit }) {
  const on = light.state === "ON";
  return (
    <div className="flex flex-col gap-2 bg-[var(--eco-surface)] px-3 py-4">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        style={{ color: on ? "var(--eco-on)" : "var(--eco-text-muted)" }}
      >
        <path
          d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.44 1 1.15 1 1.93V16h5v-.17c0-.78.4-1.5 1-1.93A6 6 0 0 0 12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-sm font-medium">{light.name}</div>
      <div className="font-mono text-[11px] text-[var(--eco-text-muted)]">
        {on ? "encendida" : "apagada"} · {light.watts}W
      </div>
    </div>
  );
}
