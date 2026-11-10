"use client";
import { useId, useState } from "react";
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
import { type Draft, emptyDraft, toDraft, validate } from "../lib/edit-server";
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
  const [draft, setDraft] = useState<Draft>(() =>
    editing ? toDraft(editing) : emptyDraft(),
  );
  const [submitted, setSubmitted] = useState(false);
  const formId = useId();
  const errors = submitted ? validate(draft, servers, editing?.id ?? null) : {};
  const set = (patch: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const groupItems = [
    { value: "none", label: "No group" },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ];
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
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (
            Object.keys(validate(draft, servers, editing?.id ?? null))
              .length === 0
          )
            onSave(draft, editing?.id ?? null);
        }}
      >
        {FIELDS.slice(0, 3).map((field) => (
          <Field
            key={field.key}
            data-invalid={!!errors[field.key as keyof typeof errors]}
          >
            <FieldLabel htmlFor={`${formId}-${field.key}`}>
              {field.label}
            </FieldLabel>
            <Input
              id={`${formId}-${field.key}`}
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => set({ [field.key]: e.target.value })}
              disabled={field.key === "code" && !!editing}
              aria-invalid={!!errors[field.key as keyof typeof errors]}
            />
            {field.hint && !errors[field.key as keyof typeof errors] && (
              <FieldDescription>{field.hint}</FieldDescription>
            )}
            {errors[field.key as keyof typeof errors] && (
              <FieldError>
                {errors[field.key as keyof typeof errors]}
              </FieldError>
            )}
          </Field>
        ))}
        <Field>
          <FieldLabel>Group</FieldLabel>
          <Pick
            label="Group"
            items={groupItems}
            value={draft.groupId ?? "none"}
            onChange={(value) =>
              set({ groupId: value === "none" ? null : value })
            }
            className="w-full"
          />
        </Field>
        {FIELDS.slice(3).map((field) => (
          <Field
            key={field.key}
            data-invalid={!!errors[field.key as keyof typeof errors]}
          >
            <FieldLabel htmlFor={`${formId}-${field.key}`}>
              {field.label}
            </FieldLabel>
            <Input
              id={`${formId}-${field.key}`}
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => set({ [field.key]: e.target.value })}
              aria-invalid={!!errors[field.key as keyof typeof errors]}
            />
            {errors[field.key as keyof typeof errors] && (
              <FieldError>
                {errors[field.key as keyof typeof errors]}
              </FieldError>
            )}
          </Field>
        ))}
        {error && <FieldError>{error}</FieldError>}
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${formId}-active`} className="text-xs font-medium">
            Active
          </label>
          <Switch
            id={`${formId}-active`}
            checked={draft.isActive}
            onCheckedChange={(isActive) => set({ isActive })}
          />
        </div>
      </form>
      <SheetFooter className="flex-row justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
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
