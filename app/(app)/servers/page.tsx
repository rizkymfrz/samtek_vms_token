import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { ServersSkeleton } from "@/features/servers/components/servers-skeleton";
import { ServersView } from "@/features/servers/components/servers-view";
import { getServers } from "@/features/servers/services/get-servers";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const ServersContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getServers());
  return <ServersView data={data} isLive={isLiveSource} />;
};

const Page = () => {
  return (
    <Suspense fallback={<ServersSkeleton />}>
      <ServersContent />
    </Suspense>
  );
};

export default Page;
