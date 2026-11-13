import { z } from "zod";
import { requiredText } from "@/lib/forms/required-text";
import { GROUP_MAX, NAME_MAX, PHOTO_MAX_BYTES } from "../schemas/face";
import type { FaceRecord } from "../types";

export const DEFAULT_GROUP = "nogroup";

export type Draft = {
  edgeId: string;
  name: string;
  group: string;
  photo: File | null;
};

export const emptyDraft = (edgeId: string): Draft => ({
  edgeId,
  name: "",
  group: "",
  photo: null,
});

export const faceDraftSchema = z.object({
  edgeId: z.string().min(1, "Choose an edge server."),
  name: requiredText("Name", NAME_MAX),
  group: z
    .string()
    .refine(
      (value) => value.trim().length <= GROUP_MAX,
      `Group can be at most ${GROUP_MAX} characters.`,
    ),
  photo: z
    .custom<File | null>()
    .refine((file) => file instanceof File, "Choose a JPEG photo.")
    .refine(
      (file) => !(file instanceof File) || file.type === "image/jpeg",
      "The photo must be a JPEG.",
    )
    .refine(
      (file) => !(file instanceof File) || file.size <= PHOTO_MAX_BYTES,
      "The photo must be 10 MB or smaller.",
    ),
});

export const toFormData = (draft: Draft) => {
  const form = new FormData();
  form.set("edgeId", draft.edgeId);
  form.set("name", draft.name.trim());
  form.set("group", draft.group.trim());
  if (draft.photo) form.set("photo", draft.photo);
  return form;
};

export const enrollLocally = (
  faces: FaceRecord[],
  draft: Draft,
  edgeName: string,
): FaceRecord[] => {
  return [
    ...faces,
    {
      id: crypto.randomUUID(),
      personId: crypto.randomUUID(),
      name: draft.name.trim(),
      group: draft.group.trim() || DEFAULT_GROUP,
      hasPhoto: false,
      edgeId: draft.edgeId,
      edgeName,
    },
  ];
};
