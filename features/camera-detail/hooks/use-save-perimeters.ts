"use client";
import { useMutation } from "@tanstack/react-query";
import type { Perimeters } from "@/lib/api/perimeters";
import { messageOf } from "@/lib/axios/browser-client";
import { savePerimeters } from "../services/camera-detail-api";

export const useSavePerimeters = (
  camera: { id: string; edgeServerId: string },
  isLive: boolean,
) => {
  const mutation = useMutation({
    mutationFn: async (perimeters: Perimeters) => {
      if (isLive) await savePerimeters(camera, perimeters);
    },
  });
  return {
    save: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error ? messageOf(mutation.error) : null,
  };
};
