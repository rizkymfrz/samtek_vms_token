"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageOf } from "@/lib/axios/browser-client";
import { FACES_QUERY_KEY } from "./use-faces";
import { type Draft, enrollLocally, toFormData } from "../lib/edit-face";
import { deleteFace, enrollFace } from "../services/face-api";
import type { FaceRecord, FacesData, Person } from "../types";

export const useFaceActions = (isLive: boolean) => {
  const queryClient = useQueryClient();
  const edit = (change: (data: FacesData) => FacesData) =>
    queryClient.setQueryData<FacesData>(
      FACES_QUERY_KEY,
      (current) => current && change(current),
    );
  const refresh = () =>
    isLive
      ? queryClient.invalidateQueries({ queryKey: FACES_QUERY_KEY })
      : undefined;
  const save = useMutation({
    mutationFn: async (draft: Draft) => {
      if (isLive) {
        await enrollFace(toFormData(draft));
        return;
      }
      edit((data) => ({
        ...data,
        faces: enrollLocally(
          data.faces,
          draft,
          data.edges.find((edge) => edge.id === draft.edgeId)?.name ?? "",
        ),
      }));
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (persons: Person[]) => {
      if (!isLive) {
        const gone = new Set(persons.flatMap((person) => person.faceIds));
        edit((data) => ({
          ...data,
          faces: data.faces.filter((face: FaceRecord) => !gone.has(face.id)),
        }));
        return;
      }
      const results = await Promise.allSettled(
        persons.flatMap((person) =>
          person.faceIds.map((id) => deleteFace(person.edgeId, id)),
        ),
      );
      if (results.some((result) => result.status === "rejected")) {
        throw new Error("Some photos could not be deleted.");
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
