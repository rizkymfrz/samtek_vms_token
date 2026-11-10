"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { layoutQueryKey } from "./use-layout";
import { LIVE_QUERY_KEY } from "./use-live";
import { createLayout, resizeLayout, summaryOf } from "../lib/edit-layout";
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
    mutationFn: async ({ next }: { layout: LiveLayout; next: LiveLayout }) => {
      if (isLive) await replaceSlotsRequest(next.id, next.slots);
    },
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
  const resize = useMutation({
    mutationFn: async ({
      layout,
      rows,
      columns,
    }: {
      layout: LiveLayout;
      rows: number;
      columns: number;
    }) => {
      if (!isLive) return;
      const next = resizeLayout(layout, rows, columns);
      const grows = rows * columns >= layout.rows * layout.columns;
      if (grows) await resizeLayoutRequest(layout.id, { rows, columns });
      await replaceSlotsRequest(layout.id, next.slots);
      if (!grows) await resizeLayoutRequest(layout.id, { rows, columns });
    },
    onMutate: async ({ layout, rows, columns }) => {
      await queryClient.cancelQueries({ queryKey: layoutQueryKey(layout.id) });
      const next = resizeLayout(layout, rows, columns);
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
  const failure =
    create.error ?? remove.error ?? changeSlots.error ?? resize.error;
  return {
    create,
    remove,
    changeSlots,
    resize,
    error: failure ? messageOf(failure) : null,
    clearError: () => {
      create.reset();
      remove.reset();
      changeSlots.reset();
      resize.reset();
    },
  };
};
