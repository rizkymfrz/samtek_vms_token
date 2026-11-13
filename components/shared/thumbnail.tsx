"use client";
import { ImageIcon, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Thumbnail = ({
  src,
  label,
  icon: Icon = ImageIcon,
  className,
  imageClassName,
  iconClassName,
}: {
  src: string | null;
  label: string;
  icon?: LucideIcon;
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
}) => {
  const [hasFailed, setHasFailed] = useState(false);
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded border bg-sidebar text-muted-foreground",
        className,
      )}
    >
      {src && !hasFailed ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="64px"
          className={cn("object-cover", imageClassName)}
          onError={() => setHasFailed(true)}
        />
      ) : (
        <Icon className={cn("size-4", iconClassName)} />
      )}
    </div>
  );
};
