"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  type CameraRecord,
  deleteCamera,
  type Draft,
  toUpdatePayload,
  updateCamera,
} from "@/features/cameras";
import type { AnalyticParams } from "@/lib/api/analytic-params";
import type { Perimeters } from "@/lib/api/perimeters";
import { messageOf } from "@/lib/axios/browser-client";

export const useCameraActions = (record: CameraRecord, isLive: boolean) => {
  const router = useRouter();
  const save = useMutation({
    mutationFn: async ({
      draft,
      perimeters,
      analyticParams,
    }: {
      draft: Draft;
      perimeters?: Perimeters;
      analyticParams?: AnalyticParams;
    }) => {
      if (!isLive) return;
      await updateCamera(record, {
        ...toUpdatePayload(draft, record),
        analyticParams,
        perimeters,
      });
    },
    onSuccess: () => router.refresh(),
  });
  const remove = useMutation({
    mutationFn: async () => {
      if (isLive) await deleteCamera(record);
    },
    onSuccess: () => router.push("/cameras"),
  });
  return {
    save: save.mutate,
    isSaving: save.isPending,
    saveError: save.error ? messageOf(save.error) : null,
    remove: remove.mutate,
    isRemoving: remove.isPending,
    removeError: remove.error ? messageOf(remove.error) : null,
  };
};
