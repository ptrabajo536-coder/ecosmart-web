"use client";

import { useLightsSystem } from "@/hooks/useLightsSystem";
import { StatusBar } from "@/components/StatusBar";
import { PowerPanel } from "@/components/PowerPanel";
import { LightGrid } from "@/components/LightGrid";
import { HistoryLog } from "@/components/HistoryLog";
import { MessageBanner } from "@/components/MessageBanner";

interface DashboardProps {
  userEmail: string;
}

export function Dashboard({ userEmail }: DashboardProps) {
  const { status, history, connection, command, message, sendAction } =
    useLightsSystem();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      <StatusBar
        mode={status?.mode ?? null}
        connected={connection === "connected"}
        updatedAt={status?.updatedAt ?? null}
        userEmail={userEmail}
      />

      <MessageBanner
        message={message}
        tone={command === "error" || connection === "disconnected" ? "error" : "info"}
      />

      <PowerPanel
        status={status}
        sending={command === "sending"}
        onAction={sendAction}
      />

      <LightGrid lights={status?.lights.items ?? null} />

      <HistoryLog entries={history} />
    </main>
  );
}
