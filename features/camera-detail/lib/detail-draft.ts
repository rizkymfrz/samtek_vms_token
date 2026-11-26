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
import type { SpeakerRule } from "@/lib/api/speaker-rule";
import {
  type SpeakerRuleDraft,
  speakerRuleDraftSchema,
  toSpeakerRuleDraft,
} from "./edit-speaker-rule";

export type DetailDraft = Draft & {
  analyticParams: AnalyticParams;
  searchIndex: SearchIndexConfig;
  speakerRule: SpeakerRuleDraft;
};

export const detailDraftSchema = cameraDraftSchema.extend({
  analyticParams: analyticParamsSchema,
  searchIndex: searchIndexSchema.refine(
    (config) => !config.isEnabled || config.labels.length > 0,
    { path: ["labels"], message: "Choose at least one label." },
  ),
  speakerRule: speakerRuleDraftSchema,
});

export const toDetailDraft = (
  record: CameraRecord,
  analyticParams: AnalyticParams,
  searchIndex: SearchIndexConfig | null | undefined,
  speakerRule: SpeakerRule | null | undefined,
): DetailDraft => ({
  ...toDraft(record),
  analyticParams,
  searchIndex: searchIndex ?? OFF_SEARCH_INDEX,
  speakerRule: toSpeakerRuleDraft(speakerRule),
});
