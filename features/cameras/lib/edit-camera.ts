import { z } from "zod";
import { requiredText } from "@/lib/forms/required-text";
import { isStreamSource, STREAM_MESSAGE } from "./stream-source";
import type { CameraRecord, ServerOption } from "../types";

export type Draft = {
  name: string;
  edgeServerId: string;
  sourceMain: string;
  sourceSub: string;
  sourceThird: string;
  analyticId: string | null;
  isEnabled: boolean;
  isRecordingEnabled: boolean;
};

export const emptyDraft = (servers: ServerOption[]): Draft => ({
  name: "",
  edgeServerId: servers[0]?.id ?? "",
  sourceMain: "",
  sourceSub: "",
  sourceThird: "",
  analyticId: null,
  isEnabled: true,
  isRecordingEnabled: false,
});

export const toDraft = (camera: CameraRecord): Draft => ({
  name: camera.name,
  edgeServerId: camera.edgeServerId,
  sourceMain: camera.sourceMain,
  sourceSub: camera.sourceSub ?? "",
  sourceThird: camera.sourceThird ?? "",
  analyticId: camera.analyticId,
  isEnabled: camera.isEnabled,
  isRecordingEnabled: camera.isRecordingEnabled,
});

const optionalSource = z
  .string()
  .refine(
    (value) => !value.trim() || isStreamSource(value.trim()),
    STREAM_MESSAGE,
  );

export const cameraDraftSchema = z
  .object({
    name: requiredText("Name", 100),
    edgeServerId: z.string().min(1, "Edge server is required."),
    sourceMain: z
      .string()
      .refine((value) => value.trim() !== "", "Main stream is required.")
      .refine((value) => isStreamSource(value.trim()), STREAM_MESSAGE),
    sourceSub: optionalSource,
    sourceThird: optionalSource,
    analyticId: z.string().nullable(),
    isEnabled: z.boolean(),
    isRecordingEnabled: z.boolean(),
  })
  .refine(
    (draft) =>
      !draft.sourceSub.trim() ||
      draft.sourceSub.trim() !== draft.sourceMain.trim(),
    {
      path: ["sourceSub"],
      message: "The sub stream must differ from the main stream.",
    },
  );

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
    sourceThird: draft.sourceThird.trim() || null,
    analyticId: draft.analyticId,
    isRecordingEnabled: draft.isRecordingEnabled,
    applyStatus: "applied",
    applyError: null,
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
  sourceThird: draft.sourceThird.trim() || undefined,
  analyticId: draft.analyticId ?? undefined,
  isRecordingEnabled: draft.isRecordingEnabled,
});

export const toUpdatePayload = (draft: Draft, original: CameraRecord) => {
  const sourceSub = draft.sourceSub.trim();
  const sourceThird = draft.sourceThird.trim();
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
    sourceThird:
      sourceThird !== (original.sourceThird ?? "")
        ? sourceThird || null
        : undefined,
    analyticId:
      draft.analyticId !== original.analyticId ? draft.analyticId : undefined,
  };
};
