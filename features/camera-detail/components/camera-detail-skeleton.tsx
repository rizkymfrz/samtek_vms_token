import { Skeleton } from "@/components/ui/skeleton";

export const CameraDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="aspect-video" />
        <Skeleton className="aspect-video" />
      </div>
    </div>
  );
};
