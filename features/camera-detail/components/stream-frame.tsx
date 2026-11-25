import { CctvOffIcon } from "lucide-react";
import { DeviceError } from "@/components/shared/device-error";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { StreamOffline } from "@/components/shared/stream-offline";
import { streamName, WebrtcPlayer } from "@/features/live";
import type { CameraDetail, StreamState } from "../types";

export const StreamFrame = ({
  detail,
  state,
  quality,
  isCapturing = false,
}: {
  detail: CameraDetail;
  state: StreamState;
  quality: "main" | "sub";
  isCapturing?: boolean;
}) => {
  if (state === "server-offline" || state === "server-disabled") {
    return <EdgeOffline isDisabled={state === "server-disabled"} />;
  }
  if (state === "stream-offline") return <StreamOffline />;
  if (state === "device-error") return <DeviceError />;
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
      audioId={quality === "main" && !isCapturing ? detail.id : undefined}
      thumbnailId={detail.id}
    />
  );
};
