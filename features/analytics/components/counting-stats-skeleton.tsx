import { Skeleton } from "@/components/ui/skeleton";

export const CountingStatsSkeleton = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="flex w-full shrink-0 flex-col gap-4 border-b p-4 lg:w-88 lg:border-r lg:border-b-0">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10" />
        <Skeleton className="h-40" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-10" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-[14rem_minmax(0,1fr)_18rem] gap-4">
          <div className="grid grid-rows-4 gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-full min-h-24" />
            ))}
          </div>
          <Skeleton className="min-h-64" />
          <Skeleton className="min-h-64" />
        </div>
        <Skeleton className="min-h-80 flex-1" />
      </div>
    </div>
  );
};
