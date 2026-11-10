"use client";
import { isAxiosError } from "axios";
import { type Dispatch, type SetStateAction, useState } from "react";
import {
  type Draft,
  removeCamera,
  saveCamera,
  toCreatePayload,
  toUpdatePayload,
} from "../lib/edit-camera";
import {
  createCamera,
  deleteCamera,
  updateCamera,
} from "../services/camera-api";
import type { CameraRecord } from "../types";

type Flags = Partial<Pick<CameraRecord, "isEnabled" | "isRecordingEnabled">>;

const messageOf = (error: unknown) =>
  isAxiosError(error) && typeof error.response?.data?.error === "string"
    ? error.response.data.error
    : "Something went wrong. Try again.";

const upsert = (all: CameraRecord[], record: CameraRecord) =>
  all.some((camera) => camera.id === record.id)
    ? all.map((camera) => (camera.id === record.id ? record : camera))
    : [...all, record];

export const useCameraActions = (
  isLive: boolean,
  cameras: CameraRecord[],
  setCameras: Dispatch<SetStateAction<CameraRecord[]>>,
) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (task: () => Promise<void>) => {
    setIsPending(true);
    setError(null);
    try {
      await task();
      return true;
    } catch (cause) {
      setError(messageOf(cause));
      return false;
    } finally {
      setIsPending(false);
    }
  };
  const save = (draft: Draft, id: string | null) =>
    run(async () => {
      if (!isLive) {
        setCameras((all) => saveCamera(all, draft, id));
        return;
      }
      const original = cameras.find((camera) => camera.id === id);
      const record = original
        ? await updateCamera(original, toUpdatePayload(draft, original))
        : await createCamera(draft.edgeServerId, toCreatePayload(draft));
      setCameras((all) => upsert(all, record));
    });
  const remove = (id: string) =>
    run(async () => {
      const original = cameras.find((camera) => camera.id === id);
      if (isLive && original) await deleteCamera(original);
      setCameras((all) => removeCamera(all, id));
    });
  const toggle = async (id: string, patch: Flags) => {
    const original = cameras.find((camera) => camera.id === id);
    if (!original) return;
    setCameras((all) => upsert(all, { ...original, ...patch }));
    if (!isLive) return;
    const ok = await run(async () => {
      const record = await updateCamera(original, patch);
      setCameras((all) => upsert(all, record));
    });
    if (!ok) setCameras((all) => upsert(all, original));
  };
  return {
    isPending,
    error,
    clearError: () => setError(null),
    save,
    remove,
    toggle,
  };
};
