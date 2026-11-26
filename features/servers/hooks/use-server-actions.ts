"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "@/features/edge-status";
import { messageOf } from "@/lib/axios/browser-client";
import { invalidateServerData } from "@/lib/query/invalidate";
import { SERVERS_QUERY_KEY } from "./use-servers";
import {
  type Draft,
  toCreatePayload,
  toUpdatePayload,
} from "../lib/edit-server";
import {
  createGroup,
  createServer,
  deleteServer,
  updateServer,
} from "../services/server-api";
import type { ServerRecord, ServersData } from "../types";

export const useServerActions = () => {
  const queryClient = useQueryClient();
  const refresh = () => invalidateServerData(queryClient);
  const save = useMutation({
    mutationFn: async ({
      draft,
      id,
    }: {
      draft: Draft;
      id: string | null;
    }): Promise<string> => {
      const original = queryClient
        .getQueryData<ServersData>(SERVERS_QUERY_KEY)
        ?.servers.find((server) => server.id === id);
      return original
        ? updateServer(original.id, toUpdatePayload(draft, original))
        : createServer(toCreatePayload(draft));
    },
    onSuccess: refresh,
  });
  const addGroup = useMutation({
    mutationFn: createGroup,
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: deleteServer,
    onSuccess: refresh,
  });
  const restartEdge = useMutation({
    mutationFn: (server: ServerRecord) =>
      sendEdgeCommand(edgeDownTopic(server.id), "edge.restart"),
  });
  return {
    save,
    addGroup,
    restartEdge,
    remove,
    addGroupError: addGroup.error ? messageOf(addGroup.error) : null,
    saveError: save.error ? messageOf(save.error) : null,
    restartEdgeError: restartEdge.error ? restartEdge.error.message : null,
    removeError: remove.error ? messageOf(remove.error) : null,
  };
};
