"use client";
import { useEffect, useMemo, useState } from "react";
import type { EndpointAddress } from "@/config/endpoints";
import { browserLocalAddress } from "../lib/browser-local-address";
import { fetchInstalledCentral } from "../lib/installed-central";

export const useLocalAddress = (): EndpointAddress | null => {
  const [installed, setInstalled] = useState<string | null>(null);
  useEffect(() => {
    let isActive = true;
    void fetchInstalledCentral().then((centralUrl) => {
      if (isActive) setInstalled(centralUrl);
    });
    return () => {
      isActive = false;
    };
  }, []);
  return useMemo(() => {
    if (installed === null) return null;
    const derived = browserLocalAddress();
    return { ...derived, centralUrl: derived.centralUrl || installed };
  }, [installed]);
};
