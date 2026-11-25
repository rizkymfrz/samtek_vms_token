import { CctvOffIcon } from "lucide-react";

export const DeviceError = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
    <CctvOffIcon className="size-8" />
    <span className="text-xs">Camera error</span>
  </div>
);
