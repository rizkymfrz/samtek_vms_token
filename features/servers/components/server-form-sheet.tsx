"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
import {
  type Draft,
  emptyDraft,
  serverDraftSchema,
  toDraft,
} from "../lib/edit-server";
import type { ServerGroup, ServerRecord } from "../types";

export type FormTarget = "new" | ServerRecord | null;

type TextField =
  | "name"
  | "code"
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
  {
    key: "code",
    label: "Code",
    placeholder: "edge-main",
    hint: "Unique. Cannot be changed later. Sets the MQTT topics.",
  },
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
  servers,
  groups,
  isPending,
  error,
  onSave,
  onClose,
}: {
  target: "new" | ServerRecord;
  servers: ServerRecord[];
  groups: ServerGroup[];
  isPending: boolean;
  error: string | null;
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onClose: () => void;
}) => {
  const editing = target === "new" ? null : target;
  const formId = useId();
  const schema = useMemo(
    () => serverDraftSchema(servers, editing?.id ?? null),
    [servers, editing?.id],
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(schema),
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
        disabled={field.key === "code" && !!editing}
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
      <SheetHeader>
        <SheetTitle>{editing ? "Edit server" : "Add server"}</SheetTitle>
        <SheetDescription>
          {editing ? editing.code : "Register an edge server by hand."}
        </SheetDescription>
      </SheetHeader>
      <form
        id={formId}
        noValidate
        className="flex flex-col gap-4 p-4 pt-0"
        onSubmit={handleSubmit((draft) => onSave(draft, editing?.id ?? null))}
      >
        {FIELDS.slice(0, 3).map(renderField)}
        <Field>
          <FieldLabel>Group</FieldLabel>
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
                className="w-full"
              />
            )}
          />
        </Field>
        {FIELDS.slice(3).map(renderField)}
        {error && <FieldError>{error}</FieldError>}
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${formId}-active`} className="text-xs font-medium">
            Active
          </label>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                id={`${formId}-active`}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </form>
      <SheetFooter className="flex-row justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isPending}>
          {editing ? "Save" : "Add server"}
        </Button>
      </SheetFooter>
    </>
  );
};

export const ServerFormSheet = ({
  target,
  servers,
  groups,
  isPending,
  error,
  onSave,
  onClose,
}: {
  target: FormTarget;
  servers: ServerRecord[];
  groups: ServerGroup[];
  isPending: boolean;
  error: string | null;
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
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
            groups={groups}
            isPending={isPending}
            error={error}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
