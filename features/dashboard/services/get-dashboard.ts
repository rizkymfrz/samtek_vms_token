import { createDevices } from "@/lib/mock/dashboard-source";
import { buildDashboard } from "./build-dashboard";

export const getDashboard = (selectedAnalytics: string[]) =>
  buildDashboard(createDevices(selectedAnalytics));
