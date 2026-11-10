import { connection } from "next/server";
import { Suspense } from "react";
import { AlertsSkeleton } from "@/features/alerts/components/alerts-skeleton";
import { AlertsView } from "@/features/alerts/components/alerts-view";
import { buildAlerts } from "@/lib/mock/alerts-source";

const AlertsContent = async () => {
  await connection();
  return <AlertsView data={buildAlerts()} />;
};

const Page = () => {
  return (
    <Suspense fallback={<AlertsSkeleton />}>
      <AlertsContent />
    </Suspense>
  );
};

export default Page;
