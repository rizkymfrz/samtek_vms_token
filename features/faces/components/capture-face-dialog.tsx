"use client";
import { useQuery } from "@tanstack/react-query";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { messageOf } from "@/lib/axios/browser-client";
import { FaceDialog } from "./face-dialog";
import { useFaceActions } from "../hooks/use-face-actions";
import { FACES_QUERY_KEY } from "../hooks/use-faces";
import { DEFAULT_GROUP } from "../lib/edit-face";
import { fetchCapture, fetchFaces } from "../services/face-api";
import type { EnrolledFace } from "../types";

export type FaceCapture = { edgeId: string; url: string };
export type EnrolledPerson = EnrolledFace & { name: string; group: string };

export const CaptureFaceDialog = ({
  capture,
  isLive,
  onSaved,
  onClose,
}: {
  capture: FaceCapture | null;
  isLive: boolean;
  onSaved: (person: EnrolledPerson) => void;
  onClose: () => void;
}) => {
  const { data: faces } = useQuery({
    queryKey: FACES_QUERY_KEY,
    queryFn: fetchFaces,
    enabled: capture !== null,
  });
  const { data: photo, error } = useQuery({
    queryKey: ["face-capture", capture?.url],
    queryFn: () => fetchCapture(capture?.url ?? ""),
    enabled: capture !== null,
    staleTime: Infinity,
  });
  useFailureToast("Failed to load the capture", [
    error ? messageOf(error, "The captured face is unavailable.") : null,
  ]);
  const { save, saveError } = useFaceActions(isLive);
  const edges = (faces?.edges ?? []).filter(
    (edge) => edge.id === capture?.edgeId,
  );
  const groups = [...new Set((faces?.faces ?? []).map((face) => face.group))];
  const close = () => {
    save.reset();
    onClose();
  };
  return (
    <FaceDialog
      target={capture && photo && edges.length > 0 ? "new" : null}
      edges={edges}
      groups={groups}
      photo={photo ?? null}
      isPending={save.isPending}
      error={saveError}
      onClose={close}
      onSave={async (draft) => {
        try {
          const created = await save.mutateAsync(draft);
          if (created) {
            onSaved({
              ...created,
              name: draft.name.trim(),
              group: draft.group.trim() || DEFAULT_GROUP,
            });
          }
          close();
        } catch {
          return;
        }
      }}
    />
  );
};
