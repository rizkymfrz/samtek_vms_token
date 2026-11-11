import {
  cameraDraftSchema,
  type CameraRecord,
  type Draft,
  toDraft,
} from "@/features/cameras";
import {
  type AnalyticParams,
  analyticParamsSchema,
} from "@/lib/api/analytic-params";

export type DetailDraft = Draft & { analyticParams: AnalyticParams };

export const detailDraftSchema = cameraDraftSchema.extend({
  analyticParams: analyticParamsSchema,
});

export const toDetailDraft = (
  record: CameraRecord,
  analyticParams: AnalyticParams,
): DetailDraft => ({ ...toDraft(record), analyticParams });
