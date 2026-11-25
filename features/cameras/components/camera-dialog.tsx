"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CctvIcon, CircleDotIcon, PowerIcon } from "lucide-react";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { DialogToggles } from "@/components/shared/dialog-toggles";
import { Pick } from "@/components/shared/pick";
import { ToggleCard } from "@/components/shared/toggle-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ANALYTICS } from "@/config/analytics-catalog";
import {
  cameraDraftSchema,
  type Draft,
  emptyDraft,
  maskSource,
  toDraft,
} from "../lib/edit-camera";
import type { CameraRecord, ServerOption } from "../types";

const SHEET_ANALYTIC_ITEMS = [
  { value: "none", label: "No analytic" },
  ...ANALYTICS.map((a) => ({ value: a.id, label: a.label })),
];

export type DialogTarget = "new" | CameraRecord | null;

const Form = ({
  target,
  initial,
  servers,
  isPending,
  error,
  onSave,
  onClose,
}: {
  target: "new" | CameraRecord;
  initial: Draft | null;
  isPending: boolean;
  error: string | null;
  servers: ServerOption[];
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onClose: () => void;
}) => {
  const editing = target === "new" ? null : target;
  const formId = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(cameraDraftSchema),
    defaultValues: editing
      ? toDraft(editing)
      : (initial ?? emptyDraft(servers)),
  });
  const serverItems = servers.map((s) => ({ value: s.id, label: s.name }));
  return (
    <>
      <DialogHeader icon={CctvIcon}>
        <DialogTitle>{editing ? "Edit camera" : "Add camera"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Change the details of this camera."
            : "Register a camera on an edge server."}
        </DialogDescription>
      </DialogHeader>
      <Separator />
      <DialogBody>
        <form
          id={formId}
          noValidate
          className="contents"
          onSubmit={handleSubmit((draft) => onSave(draft, editing?.id ?? null))}
        >
          <DialogSection>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
              <Input
                id={`${formId}-name`}
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.edgeServerId}>
              <FieldLabel>Edge server</FieldLabel>
              <Controller
                control={control}
                name="edgeServerId"
                render={({ field }) => (
                  <Pick
                    label="Edge server"
                    items={serverItems}
                    value={field.value}
                    onChange={(edgeServerId) =>
                      !editing && field.onChange(edgeServerId)
                    }
                    className="w-full"
                  />
                )}
              />
              {errors.edgeServerId && (
                <FieldError>{errors.edgeServerId.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>Analytic</FieldLabel>
              <Controller
                control={control}
                name="analyticId"
                render={({ field }) => (
                  <Pick
                    label="Analytic"
                    items={SHEET_ANALYTIC_ITEMS}
                    value={field.value ?? "none"}
                    onChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    className="w-full"
                  />
                )}
              />
            </Field>
          </DialogSection>
          <DialogDivider />
          <DialogSection>
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
            <Field data-invalid={!!errors.sourceThird}>
              <FieldLabel htmlFor={`${formId}-third`}>
                Third stream (optional)
              </FieldLabel>
              <Input
                id={`${formId}-third`}
                {...register("sourceThird")}
                placeholder="bodyworn://1001?channel=0&stream=main"
                aria-invalid={!!errors.sourceThird}
              />
              {errors.sourceThird && (
                <FieldError>{errors.sourceThird.message}</FieldError>
              )}
            </Field>
            {error && <FieldError>{error}</FieldError>}
            {editing?.applyStatus === "rejected" && editing.applyError && (
              <FieldError>
                The edge server rejected this configuration:{" "}
                {editing.applyError.message}
                {editing.applyError.field && ` (${editing.applyError.field})`}
              </FieldError>
            )}
            {editing && (
              <p className="text-xs text-muted-foreground">
                Currently {maskSource(editing.sourceMain)}. Analytic parameters
                and perimeters are not editable here yet.
              </p>
            )}
          </DialogSection>
        </form>
      </DialogBody>
      <DialogToggles>
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
              description="Record this camera on the edge server."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </DialogToggles>
      <Separator />
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isPending}>
          {editing ? "Save" : "Add camera"}
        </Button>
      </DialogFooter>
    </>
  );
};

export const CameraDialog = ({
  target,
  initial = null,
  servers,
  isPending,
  error,
  onSave,
  onClose,
}: {
  target: DialogTarget;
  initial?: Draft | null;
  isPending: boolean;
  error: string | null;
  servers: ServerOption[];
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onClose: () => void;
}) => {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        {target && (
          <Form
            key={target === "new" ? "new" : target.id}
            target={target}
            initial={initial}
            servers={servers}
            isPending={isPending}
            error={error}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
