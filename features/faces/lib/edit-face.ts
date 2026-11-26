import { z } from "zod";
import { requiredText } from "@/lib/forms/required-text";
import { GROUP_MAX, NAME_MAX, PHOTO_MAX_BYTES } from "../schemas/face";

export const DEFAULT_GROUP = "nogroup";

export const groupLabel = (group: string) =>
  group === DEFAULT_GROUP ? "No group" : group;

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
  edgeId: z.string().min(1, "Edge server is required."),
  name: requiredText("Name", NAME_MAX),
  group: z
    .string()
    .refine(
      (value) => value.trim().length <= GROUP_MAX,
      `Group can be at most ${GROUP_MAX} characters.`,
    ),
  photo: z
    .custom<File | null>()
    .refine((file) => file instanceof File, "Photo is required.")
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
