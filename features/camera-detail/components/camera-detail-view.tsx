"use client";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BreadcrumbTitle } from "@/components/shared/breadcrumb-title";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { analyticLabel } from "@/config/analytics-catalog";
import { useServerOnline } from "@/features/edge-status";
import { LivePanel } from "./live-panel";
import { PerimeterPanel } from "./perimeter-panel";
import { useSavePerimeters } from "../hooks/use-save-perimeters";
import { isSamePerimeters, isValidPerimeters } from "../lib/edit-perimeters";
import type { CameraDetail, Selection, StreamState, Tool } from "../types";

export const CameraDetailView = ({
  detail,
  isLive,
}: {
  detail: CameraDetail;
  isLive: boolean;
}) => {
  const [saved, setSaved] = useState(detail.perimeters);
  const [perimeters, setPerimeters] = useState(detail.perimeters);
  const [tool, setTool] = useState<Tool>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const { save, isPending, error } = useSavePerimeters(detail, isLive);
  const serverOnline = useServerOnline();
  const state: StreamState = !detail.isEnabled
    ? "disabled"
    : serverOnline(
          { id: detail.edgeServerId, isActive: detail.isServerActive },
          detail.isServerOnline,
        )
      ? "live"
      : "server-offline";
  const canSave =
    !isPending &&
    !isSamePerimeters(perimeters, saved) &&
    isValidPerimeters(perimeters);
  return (
    <div className="flex min-h-full flex-col gap-4 bg-background p-4">
      <BreadcrumbTitle href={`/cameras/${detail.id}`} label={detail.name} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to cameras"
            nativeButton={false}
            render={<Link href="/cameras" />}
          >
            <ArrowLeftIcon />
          </Button>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-sm font-medium">{detail.name}</h1>
            {detail.analyticId && (
              <span className="truncate text-xs text-muted-foreground">
                {analyticLabel(detail.analyticId)}
              </span>
            )}
          </div>
        </div>
        <Button
          disabled={!canSave}
          onClick={() =>
            save(perimeters, { onSuccess: () => setSaved(perimeters) })
          }
        >
          <SaveIcon />
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
      <Separator />
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <LivePanel detail={detail} state={state} />
        <Separator orientation="vertical" className="max-lg:hidden" />
        <PerimeterPanel
          detail={detail}
          state={state}
          perimeters={perimeters}
          tool={tool}
          selection={selection}
          error={error}
          onToolChange={setTool}
          onSelect={setSelection}
          onChange={setPerimeters}
        />
      </div>
    </div>
  );
};
