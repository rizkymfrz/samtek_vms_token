import { connection } from "next/server";
import { Suspense } from "react";
import { ServersSkeleton } from "@/features/servers/components/servers-skeleton";
import { ServersView } from "@/features/servers/components/servers-view";
import { buildServers } from "@/features/servers/services/build-servers";

const ServersContent = async () => {
  await connection();
  return <ServersView data={buildServers()} />;
};

const Page = () => {
  return (
    <Suspense fallback={<ServersSkeleton />}>
      <ServersContent />
    </Suspense>
  );
};

export default Page;
