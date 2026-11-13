import { Skeleton } from "@/components/ui/skeleton";

export const AnalyticDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-7 w-24" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-8" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
};
