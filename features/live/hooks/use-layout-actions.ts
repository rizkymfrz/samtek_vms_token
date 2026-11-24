"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { layoutQueryKey } from "./use-layout";
import { LIVE_QUERY_KEY } from "./use-live";
import { createLayout, summaryOf } from "../lib/edit-layout";
import {
  createLayoutRequest,
  deleteLayoutRequest,
  replaceSlotsRequest,
  resizeLayoutRequest,
} from "../services/live-api";
import type { LiveData, LiveLayout, LiveLayoutSummary } from "../types";

const emptySlots = (layout: LiveLayoutSummary) =>
  Array.from({ length: layout.rows * layout.columns }, () => null);

export const useLayoutActions = (isLive: boolean) => {
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
  const writeSummary = (layout: LiveLayoutSummary) =>
    writeLayouts((all) =>
      all.map((item) => (item.id === layout.id ? layout : item)),
    );
  const refreshDetail = (id: string) =>
    isLive
      ? queryClient.invalidateQueries({ queryKey: layoutQueryKey(id) })
      : undefined;
  const create = useMutation({
    mutationFn: async (existing: LiveLayoutSummary[]): Promise<LiveLayout> => {
      const draft = createLayout(existing);
      if (!isLive) return draft;
      const created = await createLayoutRequest({
        name: draft.name,
        rows: draft.rows,
        columns: draft.columns,
        isDefault: existing.length === 0,
      });
      return { ...created, slots: emptySlots(created) };
    },
    onSuccess: (layout) => {
      writeLayouts((all) => [...all, summaryOf(layout)]);
      writeDetail(layout);
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isLive) await deleteLayoutRequest(id);
    },
    onSuccess: (_result, id) => {
      writeLayouts((all) => all.filter((layout) => layout.id !== id));
      queryClient.removeQueries({ queryKey: layoutQueryKey(id) });
    },
  });
  const changeSlots = useMutation({
    mutationFn: async ({
      layout,
      next,
    }: {
      layout: LiveLayout;
      next: LiveLayout;
    }) => {
      if (!isLive) return;
      const size = { rows: next.rows, columns: next.columns };
      const grows = next.slots.length >= layout.slots.length;
      if (grows) await resizeLayoutRequest(next.id, size);
      await replaceSlotsRequest(next.id, next.slots);
      if (!grows) await resizeLayoutRequest(next.id, size);
    },
    onMutate: async ({ layout, next }) => {
      await queryClient.cancelQueries({ queryKey: layoutQueryKey(layout.id) });
      writeDetail(next);
      writeSummary(next);
      return { previous: layout };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      writeDetail(context.previous);
      writeSummary(context.previous);
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
