"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { messageOf } from "@/lib/axios/browser-client";
import {
  getLinkTokenState,
  getServerLinkTokenState,
  subscribeLinkToken,
} from "../lib/link-token";
import {
  fetchLinkTicket,
  postLinkAction,
  uploadLinkEvidence,
} from "../services/ticket-link-api";
import type { ActionBody } from "../types";

const LINK_QUERY_KEY = ["ticket-link"] as const;

export const useLinkToken = () =>
  useSyncExternalStore(
    subscribeLinkToken,
    getLinkTokenState,
    getServerLinkTokenState,
  );

export const useLinkTicket = (isEnabled: boolean) =>
  useQuery({
    queryKey: LINK_QUERY_KEY,
    queryFn: fetchLinkTicket,
    enabled: isEnabled,
    retry: false,
    refetchInterval: 30_000,
  });

export const useLinkActions = () => {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: LINK_QUERY_KEY });
  const run = useMutation({
    mutationFn: ({
      action,
      body = {},
    }: {
      action: "acknowledge" | "start" | "request-resolution";
      body?: ActionBody;
    }) => postLinkAction(action, body),
    onSettled: refresh,
  });
  const upload = useMutation({
    mutationFn: uploadLinkEvidence,
    onSettled: refresh,
  });
  const error = run.error ?? upload.error;
  return { run, upload, error: error ? messageOf(error) : null };
};
