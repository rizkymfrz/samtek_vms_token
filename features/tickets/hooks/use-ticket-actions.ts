"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { TICKETS_QUERY_KEY } from "./use-tickets";
import {
  postTicketAction,
  requestLink,
  uploadEvidence,
} from "../services/ticket-api";
import type { ActionBody, TicketAction } from "../types";

export const useTicketActions = () => {
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: ({
      id,
      action,
      body = {},
    }: {
      id: string;
      action: TicketAction;
      body?: ActionBody;
    }) => postTicketAction(id, action, body),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY }),
  });
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
  const upload = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadEvidence(id, file),
    onSettled: refresh,
  });
  const link = useMutation({ mutationFn: requestLink, onSettled: refresh });
  const error = run.error ?? upload.error ?? link.error;
  return { run, upload, link, error: error ? messageOf(error) : null };
};
