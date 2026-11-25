import type { z } from "zod";
import { slotsOf, summaryOf } from "../lib/edit-layout";
import type { layoutDetailSchema } from "../schemas/layout";
import type { LiveLayout } from "../types";

export const toLayout = (
  detail: z.output<typeof layoutDetailSchema>,
): LiveLayout => ({
  ...summaryOf(detail),
  cameras: slotsOf(
    detail.devices.map(({ position, device }) => ({
      position,
      id: device?.id ?? null,
    })),
  ),
});
