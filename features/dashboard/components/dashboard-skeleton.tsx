import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-80 xl:col-span-8" />
        <Skeleton className="h-80 xl:col-span-4" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
};
