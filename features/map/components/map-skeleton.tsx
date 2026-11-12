import { Skeleton } from "@/components/ui/skeleton";

export const MapSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96" />
    </div>
  );
};
