import { getDeviceStatus } from "@/services/deviceService";
import {
  LightsStatusResponse,
  LightUnit,
  TOTAL_LIGHTS,
  WATTS_PER_LIGHT,
} from "@/types/lights";

const LIGHT_NAMES = ["Luz 1", "Luz 2", "Luz 3", "Luz 4", "Luz 5", "Luz 6"];

/**
 * Construye la respuesta pública de estado a partir del estado real del relé.
 * Las 6 luces son una PROYECCIÓN del mismo relayState (ver sección 1 y 10 del spec):
 * no existen 6 controles físicos independientes todavía.
 */
export async function buildLightsStatus(): Promise<LightsStatusResponse> {
  const { mode, relayState, updatedAt } = await getDeviceStatus();

  const items: LightUnit[] = LIGHT_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    state: relayState,
    watts: relayState === "ON" ? WATTS_PER_LIGHT : 0,
  }));

  const on = relayState === "ON" ? TOTAL_LIGHTS : 0;
  const off = TOTAL_LIGHTS - on;

  return {
    success: true,
    mode,
    relay: { state: relayState },
    lights: {
      total: TOTAL_LIGHTS,
      on,
      off,
      items,
    },
    power: {
      watts: on * WATTS_PER_LIGHT,
    },
    updatedAt,
  };
}
