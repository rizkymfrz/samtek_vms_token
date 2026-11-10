import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { AlertsLive } from "@/features/alerts/components/alerts-live";
import { AlertsSkeleton } from "@/features/alerts/components/alerts-skeleton";
import { getAlerts } from "@/features/alerts/services/get-alerts";

const AlertsContent = async () => {
  await connection();
  return (
    <AlertsLive initialData={await getAlerts()} isPolling={isLiveSource} />
  );
};

const Page = () => {
  return (
    <Suspense fallback={<AlertsSkeleton />}>
      <AlertsContent />
    </Suspense>
  );
};

export default Page;
