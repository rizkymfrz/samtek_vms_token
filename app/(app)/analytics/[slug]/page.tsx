import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { BreadcrumbTitle } from "@/components/shared/breadcrumb-title";
import { isLiveSource } from "@/config/env";
import { getAlerts } from "@/features/alerts/services/get-alerts";
import { AnalyticDetailSkeleton } from "@/features/analytics/components/analytic-detail-skeleton";
import { AnalyticDetailView } from "@/features/analytics/components/analytic-detail-view";
import {
  ANALYTIC_GROUPS,
  findAnalyticGroup,
} from "@/features/analytics/lib/analytic-groups";
import { getLive } from "@/features/live/services/get-live";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

export const generateStaticParams = () =>
  ANALYTIC_GROUPS.map(({ slug }) => ({ slug }));

const AnalyticBreadcrumb = async ({
  params,
}: {
  params: PageProps<"/analytics/[slug]">["params"];
}) => {
  const { slug } = await params;
  const group = findAnalyticGroup(slug);
  if (!group) return null;
  return (
    <BreadcrumbTitle href={`/analytics/${group.slug}`} label={group.title} />
  );
};

const AnalyticDetailContent = async ({
  params,
}: {
  params: PageProps<"/analytics/[slug]">["params"];
}) => {
  await connection();
  const { slug } = await params;
  const group = findAnalyticGroup(slug);
  if (!group) notFound();
  const [live, alerts] = await redirectIfUnauthorized(
    Promise.all([getLive(), getAlerts()]),
  );
  return (
    <AnalyticDetailView
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

const Page = ({ params }: PageProps<"/analytics/[slug]">) => {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticBreadcrumb params={params} />
      </Suspense>
      <Suspense fallback={<AnalyticDetailSkeleton />}>
        <AnalyticDetailContent params={params} />
      </Suspense>
    </>
  );
};

export default Page;
