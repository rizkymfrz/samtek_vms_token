"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { BreadcrumbTitle } from "@/components/shared/breadcrumb-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyticLabel } from "@/config/analytics-catalog";
import { useServerOnline } from "@/features/edge-status";
import { CameraForm } from "./camera-form";
import { LivePanel } from "./live-panel";
import { PerimeterPanel } from "./perimeter-panel";
import { PlaybackPanel } from "./playback-panel";
import { useCameraActions } from "../hooks/use-camera-actions";
import { useParamSpecs } from "../hooks/use-param-specs";
import {
  type DetailDraft,
  detailDraftSchema,
  toDetailDraft,
} from "../lib/detail-draft";
import { isValidParams } from "../lib/edit-analytic-params";
import { isSamePerimeters, isValidPerimeters } from "../lib/edit-perimeters";
import type { CameraDetail, Selection, StreamState, Tool } from "../types";

const toRecord = (detail: CameraDetail) => ({
  id: detail.id,
  edgeServerId: detail.edgeServerId,
  name: detail.name,
  isEnabled: detail.isEnabled,
  sourceMain: detail.sourceMain,
  sourceSub: detail.sourceSub,
  analyticId: detail.analyticId,
  isRecordingEnabled: detail.isRecordingEnabled,
});

export const CameraDetailView = ({
  detail,
  isLive,
}: {
  detail: CameraDetail;
  isLive: boolean;
}) => {
  const record = toRecord(detail);
  const [saved, setSaved] = useState(detail.perimeters);
  const [perimeters, setPerimeters] = useState(detail.perimeters);
  const [tab, setTab] = useState<string | number | null>("configuration");
  useEffect(() => () => setTab("configuration"), []);
  const [tool, setTool] = useState<Tool>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const form = useForm<DetailDraft>({
    resolver: zodResolver(detailDraftSchema),
    defaultValues: toDetailDraft(record, detail.analyticParams),
  });
  const actions = useCameraActions(record, isLive);
  const analyticId = useWatch({ control: form.control, name: "analyticId" });
  const { specs, isKnown } = useParamSpecs(detail.edgeServerId, analyticId);
  const serverOnline = useServerOnline();
  const state: StreamState = !detail.isEnabled
    ? "disabled"
    : serverOnline(
          { id: detail.edgeServerId, isActive: detail.isServerActive },
          detail.isServerOnline,
        )
      ? "live"
      : "server-offline";
  const isPerimetersChanged = !isSamePerimeters(perimeters, saved);
  const params = useWatch({ control: form.control, name: "analyticParams" });
  const isParamsChanged = Boolean(form.formState.dirtyFields.analyticParams);
  const canSave =
    !actions.isSaving &&
    (form.formState.isDirty || isPerimetersChanged) &&
    isValidPerimeters(perimeters) &&
    isValidParams(specs, params);
  const save = form.handleSubmit((draft) =>
    actions.save(
      {
        draft,
        perimeters: isPerimetersChanged ? perimeters : undefined,
        analyticParams:
          draft.analyticId && isParamsChanged
            ? draft.analyticParams
            : undefined,
      },
      {
        onSuccess: () => {
          setSaved(perimeters);
          form.reset(draft);
        },
      },
    ),
  );
  const isConfiguration = tab === "configuration";
  const error = actions.saveError ?? actions.removeError;
  return (
    <div className="flex min-h-full flex-col gap-4 bg-background p-4 lg:h-[calc(100svh-var(--header-height))] lg:min-h-0">
      <BreadcrumbTitle href={`/cameras/${detail.id}`} label={detail.name} />
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="gap-0 lg:min-h-0 lg:flex-1"
      >
        <div className="mb-4 grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
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
          <TabsList variant="line" size="lg" className="sm:col-start-2">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="playback">Playback</TabsTrigger>
          </TabsList>
          {isConfiguration && (
            <Button
              className="justify-self-end sm:col-start-3"
              disabled={!canSave}
              onClick={save}
            >
              <SaveIcon />
              {actions.isSaving ? "Saving…" : "Save changes"}
            </Button>
          )}
        </div>
        <Separator />
        <TabsContent
          value="configuration"
          className="flex flex-col gap-4 pt-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto [&>*]:shrink-0"
        >
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not save the changes</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <LivePanel detail={detail} state={state} />
            <Separator orientation="vertical" className="max-lg:hidden" />
            <PerimeterPanel
              detail={detail}
              state={state}
              perimeters={perimeters}
              tool={tool}
              selection={selection}
              onToolChange={setTool}
              onSelect={setSelection}
              onChange={setPerimeters}
            />
          </div>
          <CameraForm
            detail={detail}
            form={form}
            specs={specs}
            isKnown={isKnown}
            isRemoving={actions.isRemoving}
            onRemove={() => actions.remove()}
          />
        </TabsContent>
        <TabsContent
          value="playback"
          className="pt-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
        >
          <PlaybackPanel
            detail={detail}
            isOnline={state !== "server-offline"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
