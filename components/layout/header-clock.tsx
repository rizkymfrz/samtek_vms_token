"use client";
import { useSyncExternalStore } from "react";

const subscribe = (onTick: () => void) => {
  const timer = setInterval(onTick, 1000);
  return () => clearInterval(timer);
};

const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => 0;

export const HeaderClock = () => {
  const seconds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const now = seconds ? new Date(seconds * 1000) : null;
  return (
    <div className="hidden min-w-32 flex-col items-end text-xs leading-tight lg:flex">
      <span className="font-medium tabular-nums">
        {now?.toLocaleTimeString("en-GB") ?? "--:--:--"}
      </span>
      <span className="text-muted-foreground">
        {now?.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }) ?? " "}
      </span>
    </div>
  );
};
