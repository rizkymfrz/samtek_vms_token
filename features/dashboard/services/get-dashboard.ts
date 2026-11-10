import { createDevices } from "@/app/(app)/_data/dashboard-source";
import { buildDashboard } from "./build-dashboard";

export const getDashboard = (selectedAnalytics: string[]) =>
  buildDashboard(createDevices(selectedAnalytics));
