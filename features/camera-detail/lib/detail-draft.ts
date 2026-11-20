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
import {
  OFF_SEARCH_INDEX,
  type SearchIndexConfig,
  searchIndexSchema,
} from "@/lib/api/search-index";

export type DetailDraft = Draft & {
  analyticParams: AnalyticParams;
  searchIndex: SearchIndexConfig;
};

export const detailDraftSchema = cameraDraftSchema.extend({
  analyticParams: analyticParamsSchema,
  searchIndex: searchIndexSchema.refine(
    (config) => !config.isEnabled || config.labels.length > 0,
    { path: ["labels"], message: "Choose at least one label." },
  ),
});

export const toDetailDraft = (
  record: CameraRecord,
  analyticParams: AnalyticParams,
  searchIndex: SearchIndexConfig | null | undefined,
): DetailDraft => ({
  ...toDraft(record),
  analyticParams,
  searchIndex: searchIndex ?? OFF_SEARCH_INDEX,
});
