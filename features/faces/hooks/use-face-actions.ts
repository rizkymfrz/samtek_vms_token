"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { FACES_QUERY_KEY } from "./use-faces";
import { type Draft, toFormData } from "../lib/edit-face";
import { deleteFace, enrollFace } from "../services/face-api";
import type { EnrolledFace, Person } from "../types";

export const useFaceActions = () => {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: FACES_QUERY_KEY });
  const save = useMutation({
    mutationFn: (draft: Draft): Promise<EnrolledFace | null> =>
      enrollFace(toFormData(draft)),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (persons: Person[]) => {
      const results = await Promise.allSettled(
        persons.flatMap((person) =>
          person.faceIds.map((id) => deleteFace(person.edgeId, id)),
        ),
      );
      if (results.some((result) => result.status === "rejected")) {
        throw new Error("Failed to delete some photos.");
      }
    },
    onSettled: refresh,
  });
  return {
    save,
    remove,
    saveError: save.error ? messageOf(save.error) : null,
    removeError: remove.error
      ? messageOf(remove.error, remove.error.message)
      : null,
  };
};
