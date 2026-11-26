import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { getDashboard } from "@/features/dashboard/services/get-dashboard";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const DashboardContent = async () => {
  await connection();
  return <DashboardView data={await redirectIfUnauthorized(getDashboard())} />;
};

export const metadata: Metadata = { title: "Dashboard" };

const Page = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
};

export default Page;
