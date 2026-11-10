"use client";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { logLine } from "../lib/log-lines";
import type { LogLine } from "../types";

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const KEEP = 200;

const Stream = ({
  serverId,
  online,
  startedAt,
}: {
  serverId: string;
  online: boolean;
  startedAt: number;
}) => {
  const base = Number(serverId.replace(/\D/g, "")) || 1;
  const [lines, setLines] = useState<LogLine[]>(() =>
    Array.from({ length: 30 }, (_, index) =>
      logLine(base * 1000 + index, startedAt - (30 - index) * 2000),
    ),
  );
  const [paused, setPaused] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const counter = useRef(30);
  useEffect(() => {
    if (paused || !online) return;
    const timer = setInterval(() => {
      const index = counter.current++;
      setLines((current) =>
        [...current, logLine(base * 1000 + index, Date.now())].slice(-KEEP),
      );
    }, 2000);
    return () => clearInterval(timer);
  }, [paused, online, base]);
  useEffect(() => {
    if (!paused) end.current?.scrollIntoView({ block: "end" });
  }, [lines, paused]);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-4 pt-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {!online ? "Offline: no new lines" : paused ? "Paused" : "Streaming"}{" "}
          · {lines.length} lines
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={!online}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto border bg-sidebar p-2 font-mono text-xs">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2 py-0.5">
            <span className="shrink-0 text-muted-foreground">
              {clock.format(line.at)}
            </span>
            <span
              className={cn(
                "w-12 shrink-0",
                line.level === "WARN"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {line.level}
            </span>
            <span className="break-all">{line.message}</span>
          </div>
        ))}
        <div ref={end} />
      </div>
    </div>
  );
};

export const LogSheet = ({
  server,
  online,
  startedAt,
  onClose,
}: {
  server: { id: string; name: string } | null;
  online: boolean;
  startedAt: number;
  onClose: () => void;
}) => {
  return (
    <Sheet open={server !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl">
        {server && (
          <>
            <SheetHeader>
              <SheetTitle>Log stream</SheetTitle>
              <SheetDescription>
                {server.name}. Sample lines only, until the edge exposes its
                real log.
              </SheetDescription>
            </SheetHeader>
            <Stream
              key={server.id}
              serverId={server.id}
              online={online}
              startedAt={startedAt}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
