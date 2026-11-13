import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnalyticDetailSkeleton } from "@/features/analytics/components/analytic-detail-skeleton";
import { AnalyticDetailView } from "@/features/analytics/components/analytic-detail-view";
import {
  ANALYTIC_GROUPS,
  findAnalyticGroup,
} from "@/features/analytics/lib/analytic-groups";

export const generateStaticParams = () =>
  ANALYTIC_GROUPS.map(({ slug }) => ({ slug }));

const AnalyticDetailContent = async ({
  params,
}: {
  params: PageProps<"/analytics/[slug]">["params"];
}) => {
  const { slug } = await params;
  const group = findAnalyticGroup(slug);
  if (!group) notFound();
  return <AnalyticDetailView group={group} />;
};

const Page = ({ params }: PageProps<"/analytics/[slug]">) => {
  return (
    <Suspense fallback={<AnalyticDetailSkeleton />}>
      <AnalyticDetailContent params={params} />
    </Suspense>
  );
};

export default Page;
