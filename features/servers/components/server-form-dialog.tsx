"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, PowerIcon, ServerIcon } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GroupFormDialog } from "./group-form-dialog";
import {
  type Draft,
  emptyDraft,
  serverDraftSchema,
  toDraft,
} from "../lib/edit-server";
import type { ServerGroup, ServerRecord } from "../types";

export type GroupAction = {
  isPending: boolean;
  error: string | null;
  create: (draft: { name: string; code: string }) => Promise<string>;
  reset: () => void;
};

export type FormTarget = "new" | ServerRecord | null;

type TextField =
  | "name"
  | "description"
  | "hostAddress"
  | "localHostAddress"
  | "webrtcUrl"
  | "webrtcUrlLocal"
  | "macAddress";

const FIELDS: {
  key: TextField;
  label: string;
  placeholder?: string;
  hint?: string;
}[] = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description", placeholder: "Main building" },
  {
    key: "hostAddress",
    label: "Host address",
    placeholder: "192.168.1.20:443",
  },
  {
    key: "localHostAddress",
    label: "Local host address",
    placeholder: "192.168.1.20:8889",
  },
  {
    key: "webrtcUrl",
    label: "WebRTC URL",
    placeholder: "https://edge.example.com/webrtc",
  },
  {
    key: "webrtcUrlLocal",
    label: "WebRTC URL (local network)",
    placeholder: "http://192.168.1.20:8889",
  },
  { key: "macAddress", label: "MAC address", placeholder: "00:1A:2B:3C:4D:5E" },
];

const Form = ({
  target,
  groups,
  isPending,
  error,
  groupAction,
  onSave,
  onClose,
}: {
  target: "new" | ServerRecord;
  groups: ServerGroup[];
  isPending: boolean;
  error: string | null;
  groupAction: GroupAction | null;
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onClose: () => void;
}) => {
  const [groupOpen, setGroupOpen] = useState(false);
  const editing = target === "new" ? null : target;
  const formId = useId();
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(serverDraftSchema),
    defaultValues: editing ? toDraft(editing) : emptyDraft(),
  });
  const groupItems = [
    { value: "none", label: "No group" },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ];
  const renderField = (field: (typeof FIELDS)[number]) => (
    <Field key={field.key} data-invalid={!!errors[field.key]}>
      <FieldLabel htmlFor={`${formId}-${field.key}`}>{field.label}</FieldLabel>
      <Input
        id={`${formId}-${field.key}`}
        {...register(field.key)}
        placeholder={field.placeholder}
        aria-invalid={!!errors[field.key]}
      />
      {field.hint && !errors[field.key] && (
        <FieldDescription>{field.hint}</FieldDescription>
      )}
      {errors[field.key] && (
        <FieldError>{errors[field.key]?.message}</FieldError>
      )}
    </Field>
  );
  return (
    <>
      <DialogHeader icon={ServerIcon}>
        <DialogTitle>{editing ? "Edit server" : "Add server"}</DialogTitle>
        <DialogDescription>
          {editing
            ? `Edge ID ${editing.id}`
            : "Register an edge server. Its ID is assigned automatically."}
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
            {FIELDS.slice(0, 2).map(renderField)}
            <Field>
              <FieldLabel>Group</FieldLabel>
              <div className="flex gap-2">
                <Controller
                  control={control}
                  name="groupId"
                  render={({ field }) => (
                    <Pick
                      label="Group"
                      items={groupItems}
                      value={field.value ?? "none"}
                      onChange={(value) =>
                        field.onChange(value === "none" ? null : value)
                      }
                      className="flex-1"
                    />
                  )}
                />
                {groupAction && (
                  <Button
                    type="button"
                    size="icon"
                    aria-label="New group"
                    title="New group"
                    onClick={() => setGroupOpen(true)}
                  >
                    <PlusIcon />
                  </Button>
                )}
              </div>
            </Field>
          </DialogSection>
          <DialogDivider />
          <DialogSection>
            {FIELDS.slice(2).map(renderField)}
            {error && <FieldError>{error}</FieldError>}
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <ToggleCard
                  id={`${formId}-active`}
                  icon={<PowerIcon />}
                  label="Active"
                  description="An inactive server is ignored and shown as offline."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </DialogSection>
        </form>
      </DialogBody>
      <Separator />
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isPending}>
          {editing ? "Save" : "Add server"}
        </Button>
      </DialogFooter>
      {groupAction && (
        <GroupFormDialog
          open={groupOpen}
          isPending={groupAction.isPending}
          error={groupAction.error}
          onSave={async (draft) => {
            try {
              const id = await groupAction.create(draft);
              setValue("groupId", id, { shouldDirty: true });
              setGroupOpen(false);
            } catch {
              return;
            }
          }}
          onClose={() => {
            setGroupOpen(false);
            groupAction.reset();
          }}
        />
      )}
    </>
  );
};

export const ServerFormDialog = ({
  target,
  groups,
  isPending,
  error,
  groupAction,
  onSave,
  onClose,
}: {
  target: FormTarget;
  groups: ServerGroup[];
  isPending: boolean;
  error: string | null;
  groupAction: GroupAction | null;
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
            groups={groups}
            isPending={isPending}
            error={error}
            groupAction={groupAction}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
