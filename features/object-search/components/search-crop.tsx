"use client";
import { ImageOffIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const SearchCrop = ({
  edgeId,
  resultId,
  hasCrop,
  className,
}: {
  edgeId: string;
  resultId: string;
  hasCrop: boolean;
  className?: string;
}) => {
  const [hasFailed, setHasFailed] = useState(false);
  return (
    <div
      className={cn(
        "relative flex aspect-[1/2] items-center justify-center overflow-hidden border bg-sidebar text-muted-foreground",
        className,
      )}
    >
      {hasCrop && !hasFailed ? (
        <Image
          src={`/api/edge/${edgeId}/search/${resultId}/crop`}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 16vw, 50vw"
          className="object-cover"
          onError={() => setHasFailed(true)}
        />
      ) : (
        <span className="flex flex-col items-center gap-1 px-2 text-center text-xs">
          <ImageOffIcon className="size-4" />
          Crop unavailable
        </span>
      )}
    </div>
  );
};
