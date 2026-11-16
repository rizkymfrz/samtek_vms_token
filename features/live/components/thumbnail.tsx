"use client";
import { cn } from "@/lib/utils";
import { useThumbnail } from "../hooks/use-thumbnail";

export const Thumbnail = ({
  id,
  className,
}: {
  id: string;
  className?: string;
}) => {
  const thumbnail = useThumbnail(id);
  if (!thumbnail) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbnail.url}
      alt=""
      className={cn("absolute inset-0 size-full object-fill", className)}
    />
  );
};
