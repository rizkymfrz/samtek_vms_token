import { z } from "zod";
import { createPersistedStore } from "@/lib/storage/create-persisted-store";
import { findAnalyticGroup } from "./analytic-groups";

export const MAX_TABS = 12;

const tabsSchema = z.object({
  slugs: z
    .array(z.string())
    .transform((slugs) =>
      [...new Set(slugs)].filter((slug) => findAnalyticGroup(slug)),
    )
    .transform((slugs) => slugs.slice(-MAX_TABS)),
});

export type AnalyticsTabs = z.output<typeof tabsSchema>;

export const openTab = (state: AnalyticsTabs, slug: string): AnalyticsTabs => {
  if (state.slugs.includes(slug) || !findAnalyticGroup(slug)) return state;
  return { slugs: [...state.slugs, slug].slice(-MAX_TABS) };
};

export const closeTab = (
  state: AnalyticsTabs,
  slug: string,
): AnalyticsTabs => ({
  slugs: state.slugs.filter((candidate) => candidate !== slug),
});

export const nextSlugAfterClose = (slugs: string[], slug: string) => {
  const index = slugs.indexOf(slug);
  return slugs[index + 1] ?? slugs[index - 1] ?? null;
};

export const analyticsTabsStore = createPersistedStore({
  key: "analytics:tabs",
  version: 1,
  schema: tabsSchema,
  initial: { slugs: [] } satisfies AnalyticsTabs,
});
