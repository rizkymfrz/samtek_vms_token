import { connection } from "next/server";
import { Suspense } from "react";
import { getAlerts } from "@/features/alerts/services/get-alerts";
import { AnalyticsSkeleton } from "@/features/analytics/components/analytics-skeleton";
import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { buildAnalyticsOverview } from "@/features/analytics/lib/analytics-overview";
import { getCameras } from "@/features/cameras/services/get-cameras";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const DAY_MS = 86_400_000;

const getOverview = async () => {
  const now = Date.now();
  const [cameras, alerts] = await redirectIfUnauthorized(
    Promise.all([
      getCameras(),
      getAlerts({ since: now - DAY_MS, until: null }),
    ]),
  );
  const failedEdges = [
    ...new Set([
      ...cameras.failures.map((failure) => failure.serverName),
      ...alerts.failures.map((failure) => failure.edgeName),
    ]),
  ];
  return buildAnalyticsOverview(cameras.cameras, alerts.rows, failedEdges, now);
};

const AnalyticsContent = async () => {
  await connection();
  const overview = await getOverview();
  return <AnalyticsView key={overview.snapshotAt} initial={overview} />;
};

const Page = () => {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent />
    </Suspense>
  );
};

export default Page;
