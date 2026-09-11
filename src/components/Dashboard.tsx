"use client";

import { useLightsSystem } from "@/hooks/useLightsSystem";
import { StatusBar } from "@/components/StatusBar";
import { PowerPanel } from "@/components/PowerPanel";
import { LightGrid } from "@/components/LightGrid";
import { HistoryLog } from "@/components/HistoryLog";
import { MessageBanner } from "@/components/MessageBanner";

interface DashboardProps {
  roomId: string;
  roomName: string;
  userEmail: string;
}

export function Dashboard({ roomId, roomName, userEmail }: DashboardProps) {
  const { status, history, connection, command, message, sendAction } =
    useLightsSystem(roomId);

  const lightsOn = status?.lights.on ?? 0;
  const lightsTotal = status?.lights.total ?? 0;
  const watts = status?.power.watts ?? 0;

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden>⌁</span>
          <div>
            <strong>ECOsmart</strong>
            <span>Salones inteligentes</span>
          </div>
        </div>

        <div className="profile-chip">
          <span className="avatar">{userEmail.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{userEmail.split("@")[0]}</strong>
            <span>Administrador</span>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="Navegación principal">
          <a className="active" href="#resumen"><span aria-hidden>▦</span>Inicio</a>
          <a href="#monitoreo"><span aria-hidden>⌁</span>Monitoreo</a>
          <a href="#salones"><span aria-hidden>⌂</span>Salones</a>
          <a href="#estadisticas"><span aria-hidden>▥</span>Estadísticas</a>
          <a href="#perfil"><span aria-hidden>♙</span>Mi perfil</a>
          <a href="#configuracion"><span aria-hidden>⚙</span>Configuración</a>
          <a href="#ayuda"><span aria-hidden>?</span>Ayuda</a>
        </nav>

        <div className="sidebar-footer">
          <StatusBar
            roomName={roomName}
            mode={status?.mode ?? null}
            connected={connection === "connected"}
            updatedAt={status?.updatedAt ?? null}
            userEmail={null}
          />
        </div>
      </aside>

      <section className="dashboard-content">
        <StatusBar
          roomName={roomName}
          mode={status?.mode ?? null}
          connected={connection === "connected"}
          updatedAt={status?.updatedAt ?? null}
          userEmail={userEmail}
        />

        <div className="dashboard-inner" id="resumen">
          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">Panel principal</p>
              <h1>Hola, {userEmail.split("@")[0]}</h1>
              <p>Resumen general del sistema de iluminación.</p>
            </div>
            <span className={`attention-pill ${connection === "connected" ? "ok" : ""}`}>
              <i /> {connection === "connected" ? "Sistema operativo" : "Requiere atención"}
            </span>
          </div>

          <div className="summary-grid">
            <article className="summary-card">
              <span className="summary-icon blue">⌂</span>
              <div><span>Salón seleccionado</span><strong>{roomName}</strong><small>Control en tiempo real</small></div>
            </article>
            <article className="summary-card">
              <span className="summary-icon yellow">♧</span>
              <div><span>Luces encendidas</span><strong>{lightsOn}<em>/{lightsTotal}</em></strong><small>{lightsTotal - lightsOn} apagadas</small></div>
            </article>
            <article className="summary-card">
              <span className="summary-icon green">ϟ</span>
              <div><span>Consumo estimado</span><strong>{watts} W</strong><small>En tiempo real</small></div>
            </article>
            <article className="summary-card">
              <span className="summary-icon red">∿</span>
              <div><span>Estado del sistema</span><strong>{connection === "connected" ? "Activo" : "Offline"}</strong><small>{status?.mode === "real" ? "Dispositivo real" : "Simulación"}</small></div>
            </article>
          </div>

          <MessageBanner
            message={message}
            tone={command === "error" || connection === "disconnected" ? "error" : "info"}
          />

          <div className="dashboard-panels">
            <div className="main-panel">
              <PowerPanel
                status={status}
                sending={command === "sending"}
                onAction={sendAction}
              />
              <LightGrid lights={status?.lights.items ?? null} />
            </div>
            <aside className="history-panel">
              <HistoryLog entries={history} />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
