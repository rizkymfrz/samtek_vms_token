"use client";
import { ShieldPlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { PermissionOption, RoleDraft } from "../types";

export type RoleAction = {
  isPending: boolean;
  error: string | null;
  permissions: PermissionOption[];
  permissionsError: string | null;
  create: (draft: RoleDraft) => Promise<string>;
  reset: () => void;
};

const Form = ({
  action,
  onSave,
  onClose,
}: {
  action: RoleAction;
  onSave: (draft: RoleDraft) => void;
  onClose: () => void;
}) => {
  const formId = useId();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [granted, setGranted] = useState<ReadonlySet<string>>(new Set());
  const trimmed = name.trim();
  const toggle = (code: string, isChecked: boolean) =>
    setGranted((current) => {
      const next = new Set(current);
      if (isChecked) next.add(code);
      else next.delete(code);
      return next;
    });
  return (
    <>
      <DialogHeader icon={ShieldPlusIcon}>
        <DialogTitle>Add role</DialogTitle>
        <DialogDescription>
          A role decides what its users are allowed to do.
        </DialogDescription>
      </DialogHeader>
      <Separator />
      <DialogBody>
        <form
          id={formId}
          noValidate
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed)
              onSave({
                name: trimmed,
                description: description.trim(),
                permissions: [...granted],
              });
          }}
        >
          <DialogSection>
            <Field>
              <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
              <Input
                id={`${formId}-name`}
                value={name}
                maxLength={100}
                placeholder="operator"
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-description`}>
                Description (optional)
              </FieldLabel>
              <Input
                id={`${formId}-description`}
                value={description}
                maxLength={1000}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Permissions</FieldLabel>
              {action.permissionsError ? (
                <FieldError>{action.permissionsError}</FieldError>
              ) : (
                <ul className="flex max-h-56 flex-col overflow-auto rounded border">
                  {action.permissions.map((permission) => (
                    <li
                      key={permission.code}
                      className="border-b last:border-b-0"
                    >
                      <label className="flex cursor-pointer items-start gap-2 p-2 text-xs">
                        <Checkbox
                          checked={granted.has(permission.code)}
                          onCheckedChange={(isChecked) =>
                            toggle(permission.code, isChecked)
                          }
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="font-medium">{permission.code}</span>
                          {permission.description && (
                            <span className="text-muted-foreground">
                              {permission.description}
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
            {action.error && <FieldError>{action.error}</FieldError>}
          </DialogSection>
        </form>
      </DialogBody>
      <Separator />
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={action.isPending || !trimmed}
        >
          Add role
        </Button>
      </DialogFooter>
    </>
  );
};

export const RoleFormDialog = ({
  open,
  action,
  onSave,
  onClose,
}: {
  open: boolean;
  action: RoleAction;
  onSave: (draft: RoleDraft) => void;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="md">
        {open && <Form action={action} onSave={onSave} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
};
