import { DEFAULT_LIMIT } from "./validate-search";
import type { SearchQuery } from "../types";

export type Submitted = { q: string; nonce: number };

export const toQuery = ({ q }: Submitted): SearchQuery => ({
  q,
  edgeId: null,
  deviceId: null,
  label: null,
  since: null,
  until: null,
  limit: DEFAULT_LIMIT,
});
