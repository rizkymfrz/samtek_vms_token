"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { SearchIndexConfig } from "@/lib/api/search-index";
import { messageOf } from "@/lib/axios/browser-client";
import { invalidateDeviceData } from "@/lib/query/invalidate";

export const useCameraActions = (record: CameraRecord) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: async ({
      draft,
      perimeters,
      analyticParams,
      searchIndex,
    }: {
      draft: Draft;
      perimeters?: Perimeters;
      analyticParams?: AnalyticParams;
      searchIndex?: SearchIndexConfig | null;
    }) => {
      await updateCamera(record, {
        ...toUpdatePayload(draft, record),
        analyticParams,
        perimeters,
        searchIndex,
      });
    },
    onSuccess: () => {
      void invalidateDeviceData(queryClient);
      router.refresh();
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteCamera(record),
    onSuccess: () => {
      void invalidateDeviceData(queryClient);
      router.push("/cameras");
    },
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
