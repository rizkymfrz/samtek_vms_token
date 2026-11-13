import { Skeleton } from "@/components/ui/skeleton";

export const FacesSkeleton = () => {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <div className="flex w-full flex-col gap-4 border-t p-4 max-lg:order-last lg:w-88 lg:border-t-0 lg:border-r">
        <Skeleton className="h-10" />
        <Skeleton className="h-40" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
};
