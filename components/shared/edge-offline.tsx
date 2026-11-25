import { ServerOffIcon } from "lucide-react";

export const EdgeOffline = ({
  isDisabled = false,
}: {
  isDisabled?: boolean;
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
    <ServerOffIcon className="size-8" />
    <span className="text-xs">
      {isDisabled ? "Edge server is disabled" : "Edge server is offline"}
    </span>
  </div>
);
