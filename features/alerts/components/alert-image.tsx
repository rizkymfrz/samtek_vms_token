"use client";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

export const AlertImage = ({
  path,
  src,
  className,
  iconClassName,
}: {
  path: string;
  src: string | null;
  className?: string;
  iconClassName?: string;
}) => {
  const [hasFailed, setHasFailed] = React.useState(false);
  return (
    <div
      role="img"
      aria-label={`Snapshot ${path}`}
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden border bg-sidebar text-muted-foreground",
        className,
      )}
    >
      {src && !hasFailed ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover"
          onError={() => setHasFailed(true)}
        />
      ) : (
        <ImageIcon className={cn("size-4", iconClassName)} />
      )}
    </div>
  );
};
