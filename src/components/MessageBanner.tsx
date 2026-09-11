interface MessageBannerProps {
  message: string | null;
  tone: "info" | "error";
}

export function MessageBanner({ message, tone }: MessageBannerProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="border-b px-6 py-2.5 font-mono text-xs"
      style={{
        borderColor: "var(--eco-border)",
        background: tone === "error" ? "#2a1c1c" : "var(--eco-surface-raised)",
        color: tone === "error" ? "var(--eco-warn)" : "var(--eco-text-muted)",
      }}
    >
      {message}
    </div>
  );
}
