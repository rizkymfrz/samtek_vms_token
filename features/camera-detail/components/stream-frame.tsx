import { CctvOffIcon } from "lucide-react";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { StreamOffline } from "@/components/shared/stream-offline";
import { streamName, WebrtcPlayer } from "@/features/live";
import type { CameraDetail, StreamState } from "../types";

export const StreamFrame = ({
  detail,
  state,
  quality,
}: {
  detail: CameraDetail;
  state: StreamState;
  quality: "main" | "sub";
}) => {
  if (state === "server-offline") return <EdgeOffline />;
  if (state === "stream-offline") return <StreamOffline />;
  if (state === "disabled") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <CctvOffIcon className="size-8" />
        <span className="text-xs">Camera is disabled</span>
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
