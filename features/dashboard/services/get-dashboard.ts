import { isLiveSource } from "@/config/env";
import { createDevices } from "@/lib/mock/dashboard-source";
import { buildDashboard } from "./build-dashboard";
import { getLiveDashboard } from "./get-live-dashboard";

export const getDashboard = async (selectedAnalytics: string[]) =>
  isLiveSource
    ? getLiveDashboard()
    : buildDashboard(createDevices(selectedAnalytics));
