import { Skeleton } from "@/components/ui/skeleton";

export const SpeakersSkeleton = () => {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
};
