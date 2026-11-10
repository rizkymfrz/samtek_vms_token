import { z } from "zod";
import { requiredText } from "@/lib/forms/required-text";
import type { CameraRecord, ServerOption } from "../types";

export type Draft = {
  name: string;
  edgeServerId: string;
  sourceMain: string;
  sourceSub: string;
  analyticId: string | null;
  isEnabled: boolean;
  isRecordingEnabled: boolean;
};

export const emptyDraft = (servers: ServerOption[]): Draft => ({
  name: "",
  edgeServerId: servers[0]?.id ?? "",
  sourceMain: "",
  sourceSub: "",
  analyticId: null,
  isEnabled: true,
  isRecordingEnabled: false,
});

export const toDraft = (camera: CameraRecord): Draft => ({
  name: camera.name,
  edgeServerId: camera.edgeServerId,
  sourceMain: camera.sourceMain,
  sourceSub: camera.sourceSub ?? "",
  analyticId: camera.analyticId,
  isEnabled: camera.isEnabled,
  isRecordingEnabled: camera.isRecordingEnabled,
});

const STREAM_URL = /^(rtsp|rtsps|rtmp|rtmps|http|https|srt|udp|rtp):\/\/\S+$/i;
const STREAM_MESSAGE = "Use a stream address such as rtsp:// or http(s)://.";

export const cameraDraftSchema = z.object({
  name: requiredText("Name", 100),
  edgeServerId: z.string().min(1, "Choose an edge server."),
  sourceMain: z
    .string()
    .refine((value) => value.trim() !== "", "The main stream is required.")
    .refine((value) => STREAM_URL.test(value.trim()), STREAM_MESSAGE),
  sourceSub: z
    .string()
    .refine(
      (value) => !value.trim() || STREAM_URL.test(value.trim()),
      STREAM_MESSAGE,
    ),
  analyticId: z.string().nullable(),
  isEnabled: z.boolean(),
  isRecordingEnabled: z.boolean(),
});

export const saveCamera = (
  cameras: CameraRecord[],
  draft: Draft,
  editingId: string | null,
): CameraRecord[] => {
  const record = (id: string): CameraRecord => ({
    id,
    edgeServerId: draft.edgeServerId,
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
