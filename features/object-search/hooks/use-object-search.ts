"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type Submitted, toQuery } from "../lib/filters";
import { fetchSearch } from "../services/fetch-search";

export const useObjectSearch = (submitted: Submitted | null) =>
  useQuery({
    queryKey: ["object-search", submitted],
    queryFn: ({ signal }) =>
      fetchSearch(toQuery(submitted as Submitted, Date.now()), signal),
    enabled: submitted !== null,
    retry: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
