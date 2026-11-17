"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { TicketPhoto } from "./ticket-photo";
import { fetchLinkPhoto } from "../services/ticket-link-api";

export const LinkPhoto = ({
  path,
  alt,
  className,
}: {
  path: string;
  alt: string;
  className?: string;
}) => {
  const { data: blob } = useQuery({
    queryKey: ["ticket-link-photo", path],
    queryFn: () => fetchLinkPhoto(path),
    staleTime: Infinity,
    retry: false,
  });
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return <TicketPhoto src={url} alt={alt} className={className} />;
};
