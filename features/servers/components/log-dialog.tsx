"use client";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
    <DialogBody>
      <DialogSection className="gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {!online
              ? "Offline: no new lines"
              : paused
                ? "Paused"
                : "Streaming"}{" "}
            · {lines.length} lines
          </span>
          <Button
            variant="secondary"
            disabled={!online}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
        <div className="h-80 overflow-y-auto rounded border bg-sidebar p-2 font-mono text-xs">
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
      </DialogSection>
    </DialogBody>
  );
};

export const LogDialog = ({
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
    <Dialog open={server !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        {server && (
          <>
            <DialogHeader>
              <DialogTitle>Log stream</DialogTitle>
              <DialogDescription>
                {server.name}. Sample lines only, until the edge exposes its
                real log.
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <Stream
              key={server.id}
              serverId={server.id}
              online={online}
              startedAt={startedAt}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
