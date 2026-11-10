import { z } from "zod";

export const requiredText = (label: string, max: number) =>
  z
    .string()
    .refine((value) => value.trim() !== "", `${label} is required.`)
    .refine(
      (value) => value.trim().length <= max,
      `${label} can be at most ${max} characters.`,
    );
