import { ServerOffIcon } from "lucide-react";

export const EdgeOffline = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
    <ServerOffIcon className="size-8" />
    <span className="text-xs">Edge server is offline</span>
  </div>
);
