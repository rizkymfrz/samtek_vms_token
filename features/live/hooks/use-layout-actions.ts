"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { layoutQueryKey } from "./use-layout";
import { LIVE_QUERY_KEY } from "./use-live";
import { createLayout, summaryOf } from "../lib/edit-layout";
import {
  createLayoutRequest,
  deleteLayoutRequest,
  replaceCamerasRequest,
} from "../services/live-api";
import type { LiveData, LiveLayout, LiveLayoutSummary } from "../types";

export const useLayoutActions = () => {
  const queryClient = useQueryClient();
  const writeLayouts = (
    change: (layouts: LiveLayoutSummary[]) => LiveLayoutSummary[],
  ) =>
    queryClient.setQueryData<LiveData>(
      LIVE_QUERY_KEY,
      (current) => current && { ...current, layouts: change(current.layouts) },
    );
  const writeDetail = (layout: LiveLayout) =>
    queryClient.setQueryData(layoutQueryKey(layout.id), layout);
  const refreshDetail = (id: string) =>
    queryClient.invalidateQueries({ queryKey: layoutQueryKey(id) });
  const create = useMutation({
    mutationFn: async (existing: LiveLayoutSummary[]): Promise<LiveLayout> => {
      const draft = createLayout(existing);
      const created = await createLayoutRequest({
        name: draft.name,
        isDefault: existing.length === 0,
      });
      return { ...created, cameras: [] };
    },
    onSuccess: (layout) => {
      writeLayouts((all) => [...all, summaryOf(layout)]);
      writeDetail(layout);
    },
  });
  const remove = useMutation({
    mutationFn: deleteLayoutRequest,
    onSuccess: (_result, id) => {
      writeLayouts((all) => all.filter((layout) => layout.id !== id));
      queryClient.removeQueries({ queryKey: layoutQueryKey(id) });
    },
  });
  const changeSlots = useMutation({
    mutationFn: ({ next }: { layout: LiveLayout; next: LiveLayout }) =>
      replaceCamerasRequest(next.id, next.cameras),
    onMutate: async ({ layout, next }) => {
      await queryClient.cancelQueries({ queryKey: layoutQueryKey(layout.id) });
      writeDetail(next);
      return { previous: layout };
    },
    onError: (_error, _variables, context) => {
      if (context) writeDetail(context.previous);
    },
    onSettled: (_result, _error, { layout }) => refreshDetail(layout.id),
  });
  const failure = create.error ?? remove.error ?? changeSlots.error;
  return {
    create,
    remove,
    changeSlots,
    error: failure ? messageOf(failure) : null,
    clearError: () => {
      create.reset();
      remove.reset();
      changeSlots.reset();
    },
  };
};
