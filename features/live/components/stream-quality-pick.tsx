"use client";
import { SignalIcon } from "lucide-react";
import { Pick } from "@/components/shared/pick";
import { availableQualities, QUALITY_LABEL } from "../lib/stream-quality";
import type { StreamQuality } from "../types";

export const StreamQualityPick = ({
  streams,
  value,
  onChange,
}: {
  streams: { hasSubStream: boolean; hasThirdStream: boolean };
  value: StreamQuality;
  onChange: (quality: StreamQuality) => void;
}) => {
  const qualities = availableQualities(streams);
  if (qualities.length < 2) return null;
  return (
    <Pick
      label="Stream quality"
      icon={SignalIcon}
      size="sm"
      className="w-fit"
      items={qualities.map((quality) => ({
        value: quality,
        label: QUALITY_LABEL[quality],
      }))}
      value={value}
      onChange={(next) => onChange(next as StreamQuality)}
    />
  );
};
