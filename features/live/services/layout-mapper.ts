import type { z } from "zod";
import { summaryOf } from "../lib/edit-layout";
import type { layoutDetailSchema } from "../schemas/layout";
import type { LiveLayout } from "../types";

export const toLayout = (
  detail: z.output<typeof layoutDetailSchema>,
): LiveLayout => ({
  ...summaryOf(detail),
  cameras: detail.devices
    .toSorted((a, b) => a.position - b.position)
    .flatMap(({ device }) => (device ? [device.id] : [])),
});
