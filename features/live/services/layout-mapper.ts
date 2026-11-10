import type { z } from "zod";
import { summaryOf } from "../lib/edit-layout";
import type { layoutDetailSchema } from "../schemas/layout";
import type { LiveLayout } from "../types";

export const toLayout = (
  detail: z.output<typeof layoutDetailSchema>,
): LiveLayout => {
  const slots: (string | null)[] = Array.from(
    { length: detail.rows * detail.columns },
    () => null,
  );
  for (const { position, device } of detail.devices) {
    if (device && position >= 1 && position <= slots.length) {
      slots[position - 1] = device.id;
    }
  }
  return { ...summaryOf(detail), slots };
};
