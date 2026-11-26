import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { BreadcrumbTitle } from "@/components/shared/breadcrumb-title";
import { getAlerts } from "@/features/alerts/services/get-alerts";
import { AnalyticAlertHistory } from "@/features/analytics/components/analytic-alert-history";
import { AnalyticDetailSkeleton } from "@/features/analytics/components/analytic-detail-skeleton";
import { AnalyticDetailView } from "@/features/analytics/components/analytic-detail-view";
import { AnalyticPlateHistory } from "@/features/analytics/components/analytic-plate-history";
import { AnalyticRecognitionHistory } from "@/features/analytics/components/analytic-recognition-history";
import {
  ANALYTIC_GROUPS,
  findAnalyticGroup,
  PLATE_RECOGNITION_SLUG,
} from "@/features/analytics/lib/analytic-groups";
import { getLive } from "@/features/live/services/get-live";
import { getRecognitions } from "@/features/recognitions/services/get-recognitions";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

export const generateStaticParams = () =>
  ANALYTIC_GROUPS.map(({ slug }) => ({ slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/analytics/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  return { title: findAnalyticGroup(slug)?.title ?? "Analytics" };
};

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
  const { recognizer } = group;
  const [live, history] = await redirectIfUnauthorized(
    Promise.all([
      getLive(),
      recognizer
        ? getRecognitions(recognizer).then((recognitions) => ({
            recognizer,
            recognitions,
            alerts: null,
          }))
        : getAlerts().then((alerts) => ({
            recognizer: null,
            recognitions: null,
            alerts,
          })),
    ]),
  );
  return (
    <AnalyticDetailView
      group={{
        slug: group.slug,
        title: group.title,
        analyticIds: group.analyticIds,
      }}
      live={live}
    >
      {history.recognizer === null ? (
        <AnalyticAlertHistory
          analyticIds={group.analyticIds}
          initialAlerts={history.alerts}
        />
      ) : group.slug === PLATE_RECOGNITION_SLUG ? (
        <AnalyticPlateHistory
          recognizer={history.recognizer}
          initialRecognitions={history.recognitions}
        />
      ) : (
        <AnalyticRecognitionHistory
          recognizer={history.recognizer}
          initialRecognitions={history.recognitions}
        />
      )}
    </AnalyticDetailView>
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
