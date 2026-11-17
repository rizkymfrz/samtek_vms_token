"use client";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import {
  hasTicketUpdates,
  subscribeTicketUpdates,
} from "../lib/ticket-updates";
import {
  fetchServerNames,
  fetchTicket,
  fetchTickets,
} from "../services/ticket-api";
import type { TicketFilters } from "../types";

export const TICKETS_QUERY_KEY = ["tickets"] as const;
const POLL_MS = 30_000;

export const useTickets = (filters: TicketFilters) =>
  useQuery({
    queryKey: [...TICKETS_QUERY_KEY, "list", filters],
    queryFn: () => fetchTickets(filters),
    placeholderData: keepPreviousData,
    staleTime: LIVE_STALE_TIME_MS,
    refetchInterval: hasTicketUpdates ? false : POLL_MS,
  });

export const useTicketDetail = (id: string | null) =>
  useQuery({
    queryKey: [...TICKETS_QUERY_KEY, "detail", id],
    queryFn: () => fetchTicket(id as string),
    enabled: id !== null,
  });

export const useServerNames = () =>
  useQuery({
    queryKey: ["ticket-servers"],
    queryFn: fetchServerNames,
    staleTime: LIVE_STALE_TIME_MS,
  });

export const useTicketUpdates = () => {
  const queryClient = useQueryClient();
  useEffect(
    () =>
      subscribeTicketUpdates(() => {
        void queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
      }),
    [queryClient],
  );
};
