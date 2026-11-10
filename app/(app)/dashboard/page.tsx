import { connection } from "next/server";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { getDashboard } from "@/features/dashboard/services/get-dashboard";
import { parseSelection } from "@/config/analytics-catalog";

const DashboardContent = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  await connection();
  const selected = parseSelection((await searchParams).analytics);
  return <DashboardView data={getDashboard(selected)} />;
};

const Page = ({ searchParams }: PageProps<"/dashboard">) => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
};

export default Page;
