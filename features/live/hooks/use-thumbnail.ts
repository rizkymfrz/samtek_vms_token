"use client";
import { useEffect, useState } from "react";
import {
  loadThumbnail,
  subscribeThumbnails,
} from "@/lib/storage/thumbnail-store";

export const useThumbnail = (id: string) => {
  const [thumbnail, setThumbnail] = useState<{
    url: string;
    at: number;
  } | null>(null);
  useEffect(() => {
    let url: string | null = null;
    let isCurrent = true;
    const load = () => {
      loadThumbnail(id)
        .then((found) => {
          if (!isCurrent) return;
          if (url) URL.revokeObjectURL(url);
          url = found ? URL.createObjectURL(found.blob) : null;
          setThumbnail(found && url ? { url, at: found.at } : null);
        })
        .catch((error: unknown) => {
          console.warn(`[thumbnail] ${id}: could not load`, error);
        });
    };
    load();
    const unsubscribe = subscribeThumbnails((changed) => {
      if (changed === id) load();
    });
    return () => {
      isCurrent = false;
      unsubscribe();
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return thumbnail;
};
