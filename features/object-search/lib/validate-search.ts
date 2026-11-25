import type { SearchQuery } from "../types";

export const MAX_QUERY_LENGTH = 256;
export const MAX_LABEL_LENGTH = 64;
const MAX_LIMIT = 1000;
export const DEFAULT_LIMIT = 100;
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export class SearchInputError extends Error {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(message);
  }
}

const timeOf = (value: string | null, field: string) => {
  if (value === null || value === "") return null;
  const time = Number(value);
  if (!Number.isFinite(time) || time <= 0)
    throw new SearchInputError(field, "Time is invalid.");
  return time;
};

export const parseSearchParams = (params: URLSearchParams): SearchQuery => {
  const q = (params.get("q") ?? "").trim();
  if (q.length === 0)
    throw new SearchInputError("q", "Search text is required.");
  if (q.length > MAX_QUERY_LENGTH)
    throw new SearchInputError(
      "q",
      `Search text must be at most ${MAX_QUERY_LENGTH} characters.`,
    );
  if (CONTROL.test(q))
    throw new SearchInputError("q", "Search text contains control characters.");
  const label = (params.get("label") ?? "").trim();
  if (label.length > MAX_LABEL_LENGTH || CONTROL.test(label))
    throw new SearchInputError(
      "label",
      `Label must be at most ${MAX_LABEL_LENGTH} characters.`,
    );
  const limit = params.has("limit")
    ? Number(params.get("limit"))
    : DEFAULT_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT)
    throw new SearchInputError("limit", `Limit must be 1 to ${MAX_LIMIT}.`);
  const since = timeOf(params.get("since"), "since");
  const until = timeOf(params.get("until"), "until");
  if (since !== null && until !== null && since >= until)
    throw new SearchInputError("since", "Start time must be before end time.");
  return {
    q,
    edgeId: params.get("edge_id") || null,
    deviceId: params.get("device_id") || null,
    label: label || null,
    since,
    until,
    limit,
  };
};
