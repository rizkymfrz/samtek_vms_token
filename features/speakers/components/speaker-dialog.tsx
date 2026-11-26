"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PowerIcon, Volume2Icon } from "lucide-react";
import { useId, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { DialogToggles } from "@/components/shared/dialog-toggles";
import { PasswordInput } from "@/components/shared/password-input";
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
import {
  type Draft,
  emptyDraft,
  speakerDraftSchema,
  toDraft,
} from "../lib/edit-speaker";
import type { ServerOption, SpeakerRecord } from "../types";

export type DialogTarget = "new" | SpeakerRecord | null;

const NO_SERVER = "none";

const Form = ({
  target,
  servers,
  isPending,
  error,
  onSave,
  onClose,
}: {
  target: "new" | SpeakerRecord;
  servers: ServerOption[];
  isPending: boolean;
  error: string | null;
  onSave: (
    draft: Draft,
    original: SpeakerRecord | null,
  ) => void | Promise<void>;
  onClose: () => void;
}) => {
  const editing = target === "new" ? null : target;
  const formId = useId();
  const schema = useMemo(() => speakerDraftSchema(!!editing), [editing]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(schema),
    defaultValues: editing ? toDraft(editing) : emptyDraft(),
  });
  const serverItems = [
    { value: NO_SERVER, label: "Select an edge server" },
    ...servers.map((server) => ({ value: server.id, label: server.name })),
  ];
  return (
    <>
      <DialogHeader icon={Volume2Icon}>
        <DialogTitle>{editing ? "Edit speaker" : "Add speaker"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Change the details of this speaker."
            : "Add a SIP speaker to an edge server."}
        </DialogDescription>
      </DialogHeader>
      <Separator />
      <DialogBody>
        <form
          id={formId}
          noValidate
          className="contents"
          onSubmit={handleSubmit((draft) => onSave(draft, editing))}
        >
          <DialogSection>
            {!editing && (
              <Field data-invalid={!!errors.serverId}>
                <FieldLabel>Edge server</FieldLabel>
                <Controller
                  control={control}
                  name="serverId"
                  render={({ field }) => (
                    <Pick
                      label="Edge server"
                      items={serverItems}
                      value={field.value ?? NO_SERVER}
                      onChange={(value) =>
                        field.onChange(value === NO_SERVER ? null : value)
                      }
                      className="w-full"
                    />
                  )}
                />
                {errors.serverId && (
                  <FieldError>{errors.serverId.message}</FieldError>
                )}
              </Field>
            )}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor={`${formId}-name`}>Speaker name</FieldLabel>
              <Input
                id={`${formId}-name`}
                autoComplete="off"
                placeholder="e.g. Main gate horn"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.host}>
              <FieldLabel htmlFor={`${formId}-host`}>Address</FieldLabel>
              <Input
                id={`${formId}-host`}
                autoComplete="off"
                placeholder="e.g. 192.168.77.40"
                {...register("host")}
                aria-invalid={!!errors.host}
              />
              {errors.host && <FieldError>{errors.host.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.port}>
              <FieldLabel htmlFor={`${formId}-port`}>Port</FieldLabel>
              <Input
                id={`${formId}-port`}
                inputMode="numeric"
                {...register("port")}
                aria-invalid={!!errors.port}
              />
              {errors.port && <FieldError>{errors.port.message}</FieldError>}
            </Field>
          </DialogSection>
          <DialogDivider />
          <DialogSection>
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor={`${formId}-username`}>
                Username (optional)
              </FieldLabel>
              <Input
                id={`${formId}-username`}
                autoComplete="off"
                {...register("username")}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <FieldError>{errors.username.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor={`${formId}-password`}>
                Password (optional)
              </FieldLabel>
              <PasswordInput
                id={`${formId}-password`}
                autoComplete="new-password"
                placeholder={
                  editing?.hasPassword ? "Leave blank to keep it" : undefined
                }
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.timeoutSeconds}>
              <FieldLabel htmlFor={`${formId}-timeout`}>
                Timeout (seconds)
              </FieldLabel>
              <Input
                id={`${formId}-timeout`}
                inputMode="decimal"
                {...register("timeoutSeconds")}
                aria-invalid={!!errors.timeoutSeconds}
              />
              {errors.timeoutSeconds && (
                <FieldError>{errors.timeoutSeconds.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.volume}>
              <FieldLabel htmlFor={`${formId}-volume`}>Volume (%)</FieldLabel>
              <Input
                id={`${formId}-volume`}
                inputMode="numeric"
                {...register("volume")}
                aria-invalid={!!errors.volume}
              />
              {errors.volume && (
                <FieldError>{errors.volume.message}</FieldError>
              )}
            </Field>
            {error && <FieldError>{error}</FieldError>}
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
              description="A disabled speaker does not play audio."
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
          {editing ? "Save" : "Add speaker"}
        </Button>
      </DialogFooter>
    </>
  );
};

export const SpeakerDialog = ({
  target,
  servers,
  isPending,
  error,
  onSave,
  onClose,
}: {
  target: DialogTarget;
  servers: ServerOption[];
  isPending: boolean;
  error: string | null;
  onSave: (
    draft: Draft,
    original: SpeakerRecord | null,
  ) => void | Promise<void>;
  onClose: () => void;
}) => {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        {target && (
          <Form
            key={target === "new" ? "new" : target.id}
            target={target}
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
