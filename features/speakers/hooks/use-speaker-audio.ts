"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { messageOf } from "@/lib/axios/browser-client";
import {
  deleteSpeakerAudio,
  fetchSpeakerAudio,
  uploadSpeakerAudio,
} from "../services/audio-api";

export const useSpeakerAudio = () =>
  useQuery({
    queryKey: QUERY_KEYS.speakerAudio,
    queryFn: fetchSpeakerAudio,
    staleTime: LIVE_STALE_TIME_MS,
  });

export const useSpeakerAudioActions = () => {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.speakerAudio });
  const upload = useMutation({
    mutationFn: ({
      edgeId,
      file,
      name,
    }: {
      edgeId: string;
      file: File;
      name: string;
    }) => uploadSpeakerAudio(edgeId, file, name),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: ({ edgeId, audioId }: { edgeId: string; audioId: string }) =>
      deleteSpeakerAudio(edgeId, audioId),
    onSuccess: refresh,
  });
  return {
    upload,
    remove,
    uploadError: upload.error ? messageOf(upload.error) : null,
    removeError: remove.error ? messageOf(remove.error) : null,
  };
};
