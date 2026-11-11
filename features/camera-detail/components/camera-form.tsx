"use client";
import { CameraIcon, CircleDotIcon, PowerIcon, Trash2Icon } from "lucide-react";
import { useId, useState } from "react";
import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
import { Pick } from "@/components/shared/pick";
import { ToggleCard } from "@/components/shared/toggle-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ANALYTICS } from "@/config/analytics-catalog";
import { mqttConfig } from "@/config/mqtt";
import {
  type EdgeRecording,
  type ParamSpec,
  useEdgeRecording,
} from "@/features/edge-status";
import { AnalyticParamFields } from "./analytic-params";
import type { DetailDraft } from "../lib/detail-draft";
import type { CameraDetail } from "../types";

const ANALYTIC_ITEMS = [
  { value: "none", label: "No analytic" },
  ...ANALYTICS.map((analytic) => ({
    value: analytic.id,
    label: analytic.label,
  })),
];

const recordingHint = (recording: EdgeRecording, isLive: boolean) => {
  const base = "Record this camera's footage on the edge server.";
  if (!isLive) return base;
  if (!recording.isAvailable)
    return `${base} Recording is not available on this edge.`;
  return recording.retentionDays === null
    ? base
    : `${base} Kept for ${recording.retentionDays} days.`;
};

export const CameraForm = ({
  detail,
  form,
  specs,
  isKnown,
  isRemoving,
  onRemove,
}: {
  detail: CameraDetail;
  form: UseFormReturn<DetailDraft>;
  specs: ParamSpec[];
  isKnown: boolean;
  isRemoving: boolean;
  onRemove: () => void;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const formId = useId();
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const analyticId = useWatch({ control, name: "analyticId" });
  const recording = useEdgeRecording(detail.edgeServerId);
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
            <CameraIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="text-sm font-medium">Setup Camera</h2>
            <p className="text-xs text-muted-foreground">
              Edit the camera details, then save them.
            </p>
          </div>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete camera"
            title="Delete camera"
            onClick={() => setIsConfirming(true)}
          >
            <Trash2Icon />
          </Button>
        </div>
        <Separator />
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 flex-col gap-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
              <Input
                id={`${formId}-name`}
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-server`}>Edge server</FieldLabel>
              <Input
                id={`${formId}-server`}
                value={detail.serverName}
                disabled
                readOnly
              />
            </Field>
            <Field data-invalid={!!errors.sourceMain}>
              <FieldLabel htmlFor={`${formId}-main`}>Main stream</FieldLabel>
              <Input
                id={`${formId}-main`}
                {...register("sourceMain")}
                placeholder="rtsp://10.0.0.10/stream1"
                aria-invalid={!!errors.sourceMain}
              />
              {errors.sourceMain && (
                <FieldError>{errors.sourceMain.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.sourceSub}>
              <FieldLabel htmlFor={`${formId}-sub`}>
                Sub stream (optional)
              </FieldLabel>
              <Input
                id={`${formId}-sub`}
                {...register("sourceSub")}
                placeholder="rtsp://10.0.0.10/stream2"
                aria-invalid={!!errors.sourceSub}
              />
              {errors.sourceSub && (
                <FieldError>{errors.sourceSub.message}</FieldError>
              )}
            </Field>
            <Controller
              control={control}
              name="isEnabled"
              render={({ field }) => (
                <ToggleCard
                  id={`${formId}-enabled`}
                  icon={<PowerIcon />}
                  label="Enabled"
                  description="Turn the camera on or off. A disabled camera stops streaming and analyzing."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="isRecordingEnabled"
              render={({ field }) => (
                <ToggleCard
                  id={`${formId}-recording`}
                  icon={<CircleDotIcon />}
                  label="Recording"
                  description={recordingHint(recording, mqttConfig !== null)}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <Separator orientation="vertical" className="max-lg:hidden" />
          <div className="flex min-w-0 flex-col gap-4">
            <Field>
              <FieldLabel>Analytic</FieldLabel>
              <Controller
                control={control}
                name="analyticId"
                render={({ field }) => (
                  <Pick
                    label="Analytic"
                    items={ANALYTIC_ITEMS}
                    value={field.value ?? "none"}
                    onChange={(value) => {
                      field.onChange(value === "none" ? null : value);
                      form.setValue(
                        "analyticParams",
                        {},
                        { shouldDirty: true },
                      );
                    }}
                    className="w-full"
                  />
                )}
              />
            </Field>
            {analyticId && (
              <>
                {specs.length > 0 ? (
                  <Controller
                    control={control}
                    name="analyticParams"
                    render={({ field }) => (
                      <AnalyticParamFields
                        specs={specs}
                        params={field.value}
                        idPrefix={formId}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {isKnown
                      ? "This analytic has no parameters."
                      : "Parameters load when the edge server is online."}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {detail.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The camera is removed from the system and from every layout. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemoving}
              onClick={onRemove}
            >
              Delete camera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
