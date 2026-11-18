import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { getAlerts } from "@/features/alerts/services/get-alerts";
import { CountingStatsSkeleton } from "@/features/analytics/components/counting-stats-skeleton";
import { CountingStatsView } from "@/features/analytics/components/counting-stats-view";
import {
  COUNTING_STATS_SLUGS,
  findAnalyticGroup,
} from "@/features/analytics/lib/analytic-groups";
import { getLive } from "@/features/live/services/get-live";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

export const generateStaticParams = () =>
  COUNTING_STATS_SLUGS.map((slug) => ({ slug }));

const StatsContent = async ({
  params,
}: {
  params: PageProps<"/analytics/[slug]/stats">["params"];
}) => {
  await connection();
  const { slug } = await params;
  const group = findAnalyticGroup(slug);
  if (!group || !COUNTING_STATS_SLUGS.includes(slug)) notFound();
  const [live, alerts] = await redirectIfUnauthorized(
    Promise.all([getLive(), getAlerts()]),
  );
  return (
    <CountingStatsView
      group={{
        slug: group.slug,
        title: group.title,
        analyticIds: group.analyticIds,
      }}
      live={live}
      alerts={alerts}
      isLive={isLiveSource}
    />
  );
};

const Page = ({ params }: PageProps<"/analytics/[slug]/stats">) => {
  return (
    <Suspense fallback={<CountingStatsSkeleton />}>
      <StatsContent params={params} />
    </Suspense>
  );
};

export default Page;
