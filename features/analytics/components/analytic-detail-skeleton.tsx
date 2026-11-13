import { Skeleton } from "@/components/ui/skeleton";

export const AnalyticDetailSkeleton = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        <div className="flex items-center justify-start gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-rows-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="aspect-video lg:aspect-auto" />
          ))}
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-4 border-t p-4 lg:w-88 lg:border-t-0 lg:border-l">
        <div className="flex h-10 items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-10" />
        </div>
        <Skeleton className="h-64 lg:min-h-0 lg:flex-1" />
      </div>
    </div>
  );
};
