"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "../services/user-api";

export const usePermissions = (isEnabled: boolean) =>
  useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
    enabled: isEnabled,
    staleTime: Infinity,
  });
