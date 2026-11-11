import { Skeleton } from "@/components/ui/skeleton";

export const CamerasSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-10 w-full max-w-3xl" />
      <Skeleton className="h-96" />
    </div>
  );
};
