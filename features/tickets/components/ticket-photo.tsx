"use client";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const TicketPhoto = ({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) => {
  const [hasFailed, setHasFailed] = useState(false);
  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden border bg-sidebar text-muted-foreground",
        className,
      )}
    >
      {src && !hasFailed ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover"
          onError={() => setHasFailed(true)}
        />
      ) : (
        <ImageIcon className="size-4" />
      )}
    </div>
  );
};
