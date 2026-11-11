import { ServerOffIcon, VideoOffIcon } from "lucide-react";
import { streamName, WebrtcPlayer } from "@/features/live";
import type { CameraDetail, StreamState } from "../types";

const HINT = {
  disabled: { Icon: VideoOffIcon, label: "Camera is disabled" },
  "server-offline": { Icon: ServerOffIcon, label: "Edge server is offline" },
} as const;

export const StreamFrame = ({
  detail,
  state,
  quality,
}: {
  detail: CameraDetail;
  state: StreamState;
  quality: "main" | "sub";
}) => {
  if (state !== "live") {
    const { Icon, label } = HINT[state];
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon className="size-8" />
        <span className="text-xs">{label}</span>
      </div>
    );
  }
  return (
    <WebrtcPlayer
      relay={detail}
      stream={streamName(detail.id, quality, detail.hasSubStream)}
    />
  );
};
