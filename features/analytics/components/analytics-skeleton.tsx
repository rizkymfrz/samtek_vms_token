import { Skeleton } from "@/components/ui/skeleton";

export const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:min-h-0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-4 lg:grid-rows-3">
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index} className="min-h-48" />
        ))}
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  );
};
