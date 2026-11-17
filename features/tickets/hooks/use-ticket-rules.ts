"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { fetchRules, patchRule } from "../services/ticket-api";

const rulesKey = (serverId: string | null) =>
  ["ticket-rules", serverId] as const;

export const useTicketRules = (serverId: string | null) =>
  useQuery({
    queryKey: rulesKey(serverId),
    queryFn: () => fetchRules(serverId as string),
    enabled: serverId !== null,
  });

export const useRuleToggle = (serverId: string | null) => {
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      patchRule(serverId as string, id, isEnabled),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: rulesKey(serverId) }),
  });
  return { toggle, error: toggle.error ? messageOf(toggle.error) : null };
};
