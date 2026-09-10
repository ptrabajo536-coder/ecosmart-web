/**
 * Tipos de dominio compartidos por el backend y el frontend de ECOsmart.
 *
 * Estos tipos representan el "contrato" de la API /api/lights.
 * La aplicación Android (fase futura) debe consumir exactamente esta misma
 * forma de datos, por lo que este archivo es la fuente de verdad.
 */

/** Estado físico del relé del Sonoff MINI R4 (o su simulación). */
export type RelayState = "ON" | "OFF";

/** Acción que se le puede pedir al deviceService / a la API. */
export type RelayAction = "ON" | "OFF";

/** Modo de operación del deviceService. */
export type DeviceMode = "simulation" | "real";

/** Potencia asumida por bombillo, en vatios. Ver sección 8 del spec. */
export const WATTS_PER_LIGHT = 18;

/** Número total de luces lógicas conectadas al único relé. */
export const TOTAL_LIGHTS = 6;

/** Una de las 6 tarjetas de luz mostradas en la UI. Todas comparten el mismo estado del relé. */
export interface LightUnit {
  id: number;
  name: string;
  state: RelayState;
  watts: number;
}

/** Resumen de estadísticas derivado del estado del relé. */
export interface LightsSummary {
  total: number;
  on: number;
  off: number;
}

/** Información de consumo estimado. */
export interface PowerInfo {
  watts: number;
}

/** Una entrada del historial de acciones ("Últimas acciones"). */
export interface HistoryEntry {
  id: string;
  action: RelayAction;
  timestamp: string; // ISO 8601
  userEmail: string;
}

/** Cuerpo de la respuesta de GET /api/lights. */
export interface LightsStatusResponse {
  success: true;
  mode: DeviceMode;
  relay: {
    state: RelayState;
  };
  lights: {
    total: number;
    on: number;
    off: number;
    items: LightUnit[];
  };
  power: PowerInfo;
  updatedAt: string; // ISO 8601
}

/** Cuerpo de la solicitud de POST /api/lights. */
export interface LightsActionRequest {
  action: RelayAction;
}

/** Respuesta de error estándar de la API. */
export interface ApiErrorResponse {
  success: false;
  error: string;
}

/** Respuesta de GET /api/history. */
export interface HistoryResponse {
  success: true;
  history: HistoryEntry[];
}
