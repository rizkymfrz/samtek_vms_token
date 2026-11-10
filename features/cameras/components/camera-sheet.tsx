"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pick } from "@/components/shared/pick";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
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

export type SheetTarget = "new" | CameraRecord | null;

const Form = ({
  target,
  servers,
  isPending,
  error,
  onSave,
  onDelete,
  onClose,
}: {
  target: "new" | CameraRecord;
  isPending: boolean;
  error: string | null;
  servers: ServerOption[];
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onClose: () => void;
}) => {
  const editing = target === "new" ? null : target;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const formId = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(cameraDraftSchema),
    defaultValues: editing ? toDraft(editing) : emptyDraft(servers),
  });
  const serverItems = servers.map((s) => ({ value: s.id, label: s.name }));
  return (
    <>
      <SheetHeader>
        <SheetTitle>{editing ? "Edit camera" : "Add camera"}</SheetTitle>
        <SheetDescription>
          {editing
            ? `Device ${editing.deviceId}`
            : "Register a camera on an edge server."}
        </SheetDescription>
      </SheetHeader>
      <form
        id={formId}
        noValidate
        className="flex flex-col gap-4 p-4 pt-0"
        onSubmit={handleSubmit((draft) => onSave(draft, editing?.id ?? null))}
      >
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
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${formId}-enabled`} className="text-xs font-medium">
            Enabled
          </label>
          <Controller
            control={control}
            name="isEnabled"
            render={({ field }) => (
              <Switch
                id={`${formId}-enabled`}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor={`${formId}-recording`}
            className="text-xs font-medium"
          >
            Recording
          </label>
          <Controller
            control={control}
            name="isRecordingEnabled"
            render={({ field }) => (
              <Switch
                id={`${formId}-recording`}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        {error && <FieldError>{error}</FieldError>}
        {editing && (
          <p className="text-xs text-muted-foreground">
            Currently {maskSource(editing.sourceMain)}. Analytic parameters and
            perimeters are not editable here yet.
          </p>
        )}
      </form>
      <SheetFooter className="flex-row items-center justify-between">
        {editing ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2Icon />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {editing ? "Save" : "Add camera"}
          </Button>
        </div>
      </SheetFooter>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {editing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The camera is removed from every layout and stops streaming.
              Alerts it already raised are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => editing && onDelete(editing.id)}
            >
              Delete camera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const CameraSheet = ({
  target,
  servers,
  isPending,
  error,
  onSave,
  onDelete,
  onClose,
}: {
  target: SheetTarget;
  isPending: boolean;
  error: string | null;
  servers: ServerOption[];
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onClose: () => void;
}) => {
  return (
    <Sheet open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {target && (
          <Form
            key={target === "new" ? "new" : target.id}
            target={target}
            servers={servers}
            isPending={isPending}
            error={error}
            onSave={onSave}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
