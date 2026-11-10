import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { UsersSkeleton } from "@/features/users/components/users-skeleton";
import { UsersView } from "@/features/users/components/users-view";
import { getUsersIfAllowed } from "@/features/users/services/get-users";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const UsersContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getUsersIfAllowed());
  if (!data) {
    return (
      <p className="p-8 text-center text-xs text-muted-foreground">
        You do not have permission to view users.
      </p>
    );
  }
  return <UsersView data={data} isLive={isLiveSource} />;
};

const Page = () => {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContent />
    </Suspense>
  );
};

export default Page;
