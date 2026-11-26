"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { invalidateDeviceData } from "@/lib/query/invalidate";
import { CAMERAS_QUERY_KEY } from "./use-cameras";
import {
  type Draft,
  toCreatePayload,
  toUpdatePayload,
} from "../lib/edit-camera";
import {
  createCamera,
  deleteCamera,
  updateCamera,
} from "../services/camera-api";
import type { CameraData, CameraRecord } from "../types";

type Flags = Partial<Pick<CameraRecord, "isEnabled" | "isRecordingEnabled">>;

export const useCameraActions = () => {
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<CameraData>(CAMERAS_QUERY_KEY)?.cameras ?? [];
  const edit = (change: (cameras: CameraRecord[]) => CameraRecord[]) =>
    queryClient.setQueryData<CameraData>(
      CAMERAS_QUERY_KEY,
      (current) => current && { ...current, cameras: change(current.cameras) },
    );
  const refresh = () => invalidateDeviceData(queryClient);
  const save = useMutation({
    mutationFn: async ({ draft, id }: { draft: Draft; id: string | null }) => {
      const original = read().find((camera) => camera.id === id);
      if (original) {
        await updateCamera(original, toUpdatePayload(draft, original));
      } else {
        await createCamera(draft.edgeServerId, toCreatePayload(draft));
      }
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const original = read().find((camera) => camera.id === id);
      if (original) await deleteCamera(original);
    },
    onSuccess: refresh,
  });
  const toggle = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Flags }) => {
      const original = read().find((camera) => camera.id === id);
      if (original) await updateCamera(original, patch);
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: CAMERAS_QUERY_KEY });
      const previous = queryClient.getQueryData<CameraData>(CAMERAS_QUERY_KEY);
      edit((all) =>
        all.map((camera) =>
          camera.id === id ? { ...camera, ...patch } : camera,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CAMERAS_QUERY_KEY, context.previous);
      }
    },
    onSettled: refresh,
  });
  const errorOf = (...errors: unknown[]) => {
    const found = errors.find(Boolean);
    return found ? messageOf(found) : null;
  };
  return {
    save,
    remove,
    toggle,
    saveError: errorOf(save.error),
    removeError: errorOf(remove.error),
    toggleError: errorOf(toggle.error),
  };
};
