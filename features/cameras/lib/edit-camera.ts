import type { CameraRecord, ServerOption } from "../types";

export type Draft = {
  name: string;
  deviceId: string;
  edgeServerId: string;
  sourceMain: string;
  sourceSub: string;
  analyticId: string | null;
  isEnabled: boolean;
  isRecordingEnabled: boolean;
};

export type Errors = Partial<
  Record<
    "name" | "deviceId" | "edgeServerId" | "sourceMain" | "sourceSub",
    string
  >
>;

export const emptyDraft = (servers: ServerOption[]): Draft => ({
  name: "",
  deviceId: "",
  edgeServerId: servers[0]?.id ?? "",
  sourceMain: "",
  sourceSub: "",
  analyticId: null,
  isEnabled: true,
  isRecordingEnabled: false,
});

export const toDraft = (camera: CameraRecord): Draft => ({
  name: camera.name,
  deviceId: camera.deviceId,
  edgeServerId: camera.edgeServerId,
  sourceMain: camera.sourceMain,
  sourceSub: camera.sourceSub ?? "",
  analyticId: camera.analyticId,
  isEnabled: camera.isEnabled,
  isRecordingEnabled: camera.isRecordingEnabled,
});

const STREAM_URL = /^(rtsp|rtsps|rtmp|rtmps|http|https|srt|udp|rtp):\/\/\S+$/i;

export const validate = (
  draft: Draft,
  cameras: CameraRecord[],
  editingId: string | null,
): Errors => {
  const errors: Errors = {};
  const name = draft.name.trim();
  const deviceId = draft.deviceId.trim();
  if (!name) errors.name = "Name is required.";
  else if (name.length > 100)
    errors.name = "Name can be at most 100 characters.";
  if (!deviceId) errors.deviceId = "Device ID is required.";
  else if (deviceId.length > 64)
    errors.deviceId = "Device ID can be at most 64 characters.";
  else if (
    cameras.some(
      (c) =>
        c.id !== editingId &&
        c.edgeServerId === draft.edgeServerId &&
        c.deviceId === deviceId,
    )
  ) {
    errors.deviceId = "This edge server already has a camera with that ID.";
  }
  if (!draft.edgeServerId) errors.edgeServerId = "Choose an edge server.";
  if (!draft.sourceMain.trim())
    errors.sourceMain = "The main stream is required.";
  else if (!STREAM_URL.test(draft.sourceMain.trim()))
    errors.sourceMain = "Use a stream address such as rtsp:// or http(s)://.";
  if (draft.sourceSub.trim() && !STREAM_URL.test(draft.sourceSub.trim())) {
    errors.sourceSub = "Use a stream address such as rtsp:// or http(s)://.";
  }
  return errors;
};

export const saveCamera = (
  cameras: CameraRecord[],
  draft: Draft,
  editingId: string | null,
): CameraRecord[] => {
  const record = (id: string): CameraRecord => ({
    id,
    edgeServerId: draft.edgeServerId,
    deviceId: draft.deviceId.trim(),
    name: draft.name.trim(),
    isEnabled: draft.isEnabled,
    sourceMain: draft.sourceMain.trim(),
    sourceSub: draft.sourceSub.trim() || null,
    analyticId: draft.analyticId,
    isRecordingEnabled: draft.isRecordingEnabled,
  });
  if (editingId === null) {
    const nextId = String(
      Math.max(0, ...cameras.map((c) => Number(c.id) || 0)) + 1,
    );
    return [...cameras, record(nextId)];
  }
  return cameras.map((c) => (c.id === editingId ? record(c.id) : c));
};

export const removeCamera = (cameras: CameraRecord[], id: string) =>
  cameras.filter((c) => c.id !== id);

export const maskSource = (url: string | null): string => {
  if (!url) return "Not set";
  return url.replace(/^([a-z]+:\/\/)[^/@\s]*@/i, "$1");
};

export const toCreatePayload = (draft: Draft) => ({
  deviceId: draft.deviceId.trim(),
  name: draft.name.trim(),
  isEnabled: draft.isEnabled,
  sourceMain: draft.sourceMain.trim(),
  sourceSub: draft.sourceSub.trim() || undefined,
  analyticId: draft.analyticId ?? undefined,
  isRecordingEnabled: draft.isRecordingEnabled,
});

export const toUpdatePayload = (draft: Draft, original: CameraRecord) => {
  const sourceSub = draft.sourceSub.trim();
  return {
    name: draft.name.trim() !== original.name ? draft.name.trim() : undefined,
    isEnabled:
      draft.isEnabled !== original.isEnabled ? draft.isEnabled : undefined,
    isRecordingEnabled:
      draft.isRecordingEnabled !== original.isRecordingEnabled
        ? draft.isRecordingEnabled
        : undefined,
    sourceMain:
      draft.sourceMain.trim() !== original.sourceMain
        ? draft.sourceMain.trim()
        : undefined,
    sourceSub:
      sourceSub !== (original.sourceSub ?? "") ? sourceSub || null : undefined,
    analyticId:
      draft.analyticId !== original.analyticId ? draft.analyticId : undefined,
  };
};
