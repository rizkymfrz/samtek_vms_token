import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { AlertsLive } from "@/features/alerts/components/alerts-live";
import { AlertsSkeleton } from "@/features/alerts/components/alerts-skeleton";
import { getAlerts } from "@/features/alerts/services/get-alerts";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const AlertsContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getAlerts());
  return <AlertsLive initialData={data} isPolling={isLiveSource} />;
};

const Page = () => {
  return (
    <Suspense fallback={<AlertsSkeleton />}>
      <AlertsContent />
    </Suspense>
  );
};

export default Page;
