import axios from "axios";
import { http } from "@/lib/axios/browser-client";
import { SearchInputError } from "../lib/validate-search";
import type { SearchData, SearchQuery } from "../types";

export const fetchSearch = async (query: SearchQuery, signal: AbortSignal) => {
  try {
    return (
      await http.get<SearchData>("/api/search", {
        signal,
        params: {
          q: query.q,
          limit: query.limit,
          ...(query.edgeId && { edge_id: query.edgeId }),
          ...(query.deviceId && { device_id: query.deviceId }),
          ...(query.label && { label: query.label }),
          ...(query.since !== null && { since: query.since }),
          ...(query.until !== null && { until: query.until }),
        },
      })
    ).data;
  } catch (error) {
    const body = axios.isAxiosError(error) ? error.response?.data : null;
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new SearchInputError(
        typeof body?.field === "string" ? body.field : "q",
        typeof body?.error === "string" ? body.error : "The search is invalid.",
      );
    }
    throw error;
  }
};
