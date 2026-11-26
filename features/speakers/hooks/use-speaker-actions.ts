"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query";
import { messageOf } from "@/lib/axios/browser-client";
import {
  type Draft,
  hasChanges,
  toCreatePayload,
  toUpdatePayload,
} from "../lib/edit-speaker";
import {
  createSpeaker,
  deleteSpeaker,
  testSpeaker,
  updateSpeaker,
} from "../services/speaker-api";
import type { SpeakerRecord } from "../types";

export const useSpeakerActions = () => {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.speakers });
  const save = useMutation({
    mutationFn: async ({
      draft,
      original,
    }: {
      draft: Draft;
      original: SpeakerRecord | null;
    }) => {
      if (!original) {
        if (!draft.serverId) return;
        return createSpeaker(draft.serverId, toCreatePayload(draft));
      }
      const patch = toUpdatePayload(draft, original);
      if (hasChanges(patch)) {
        await updateSpeaker(original.edgeServerId, original.id, patch);
      }
    },
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: (speaker: SpeakerRecord) =>
      deleteSpeaker(speaker.edgeServerId, speaker.id),
    onSuccess: refresh,
  });
  const test = useMutation({
    mutationFn: (speaker: SpeakerRecord) =>
      testSpeaker(speaker.edgeServerId, speaker.id),
  });
  return {
    save,
    remove,
    test,
    saveError: save.error ? messageOf(save.error) : null,
    removeError: remove.error ? messageOf(remove.error) : null,
    testError: test.error ? messageOf(test.error) : null,
  };
};
