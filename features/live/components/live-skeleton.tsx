import { Skeleton } from "@/components/ui/skeleton";

export const LiveSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-10 w-96" />
      <div className="grid gap-2 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="aspect-video" />
        ))}
      </div>
    </div>
  );
};
