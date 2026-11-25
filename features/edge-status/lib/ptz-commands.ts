import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "./edge-status-store";
import { ptzResultSchema } from "../schemas/edge-message";
import type { PtzPreset } from "../types";

export type PtzMove = {
  pan?: number;
  tilt?: number;
  zoom?: number;
  durationMs?: number;
};

const send = (
  edgeId: string,
  type: string,
  deviceId: string,
  data: Record<string, unknown> = {},
) =>
  sendEdgeCommand(edgeDownTopic(edgeId), type, {
    device_id: deviceId,
    ...data,
  });

const readPtz = (result: { ptz?: unknown }) => {
  const parsed = ptzResultSchema.safeParse(result.ptz);
  if (!parsed.success)
    throw new Error("The edge server sent an unreadable answer.");
  return parsed.data;
};

export const listPtzPresets = async (
  edgeId: string,
  deviceId: string,
): Promise<PtzPreset[]> =>
  readPtz(await send(edgeId, "ptz.list_presets", deviceId)).presets ?? [];

export const setPtzPreset = async (
  edgeId: string,
  deviceId: string,
  name: string,
): Promise<PtzPreset> => {
  const { preset } = readPtz(
    await send(edgeId, "ptz.set_preset", deviceId, { preset_name: name }),
  );
  if (!preset) throw new Error("The edge server sent an unreadable answer.");
  return preset;
};

export const callPtzPreset = (
  edgeId: string,
  deviceId: string,
  token: string,
) => send(edgeId, "ptz.call_preset", deviceId, { preset_token: token });

export const deletePtzPreset = (
  edgeId: string,
  deviceId: string,
  token: string,
) => send(edgeId, "ptz.delete_preset", deviceId, { preset_token: token });

export const movePtz = (
  edgeId: string,
  deviceId: string,
  { pan, tilt, zoom, durationMs }: PtzMove,
) =>
  send(edgeId, "ptz.move", deviceId, {
    ...(pan !== undefined && { pan }),
    ...(tilt !== undefined && { tilt }),
    ...(zoom !== undefined && { zoom }),
    ...(durationMs !== undefined && { duration_ms: durationMs }),
  });

export const focusPtz = (
  edgeId: string,
  deviceId: string,
  speed: number,
  durationMs?: number,
) =>
  send(edgeId, "ptz.focus", deviceId, {
    speed,
    ...(durationMs !== undefined && { duration_ms: durationMs }),
  });

export const stopPtz = (edgeId: string, deviceId: string) =>
  send(edgeId, "ptz.stop", deviceId);

export const homePtz = (edgeId: string, deviceId: string) =>
  send(edgeId, "ptz.home", deviceId);
