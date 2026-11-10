"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "@/features/edge-status";
import { messageOf } from "@/lib/axios/browser-client";
import { SERVERS_QUERY_KEY } from "./use-servers";
import {
  type Draft,
  removeServer,
  saveServer,
  toCreatePayload,
  toUpdatePayload,
} from "../lib/edit-server";
import {
  createServer,
  deleteServer,
  updateServer,
} from "../services/server-api";
import type { ServerRecord, ServersData } from "../types";

export const useServerActions = (isLive: boolean) => {
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<ServersData>(SERVERS_QUERY_KEY)?.servers ?? [];
  const edit = (change: (servers: ServerRecord[]) => ServerRecord[]) =>
    queryClient.setQueryData<ServersData>(
      SERVERS_QUERY_KEY,
      (current) => current && { ...current, servers: change(current.servers) },
    );
  const refresh = () =>
    isLive
      ? queryClient.invalidateQueries({ queryKey: SERVERS_QUERY_KEY })
      : undefined;
  const save = useMutation({
    mutationFn: async ({
      draft,
      id,
    }: {
      draft: Draft;
      id: string | null;
    }): Promise<string> => {
      if (!isLive) {
        const next = saveServer(read(), draft, id);
        edit(() => next);
        return id ?? next[next.length - 1].id;
      }
      const original = read().find((server) => server.id === id);
      return original
        ? updateServer(original.id, toUpdatePayload(draft, original))
        : createServer(toCreatePayload(draft));
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isLive) await deleteServer(id);
      else edit((all) => removeServer(all, id));
    },
    onSuccess: refresh,
  });
  const restartEdge = useMutation({
    mutationFn: (server: ServerRecord) =>
      sendEdgeCommand(edgeDownTopic(server.id), "edge.restart"),
  });
  return {
    save,
    restartEdge,
    remove,
    replaceServers: edit,
    saveError: save.error ? messageOf(save.error) : null,
    restartEdgeError: restartEdge.error ? restartEdge.error.message : null,
    removeError: remove.error ? messageOf(remove.error) : null,
  };
};
