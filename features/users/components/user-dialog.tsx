"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, UserCheckIcon, UserIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
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
import { type RoleAction, RoleFormDialog } from "./role-form-dialog";
import {
  type Draft,
  emptyDraft,
  toDraft,
  userDraftSchema,
} from "../lib/edit-user";
import type { RoleOption, ServerOption, UserRecord } from "../types";

export type DialogTarget = "new" | UserRecord | null;

const NO_ROLE = "none";
const NO_SERVER = "none";

const Form = ({
  target,
  users,
  roles,
  servers,
  isPending,
  error,
  roleAction,
  onSave,
  onClose,
}: {
  target: "new" | UserRecord;
  users: UserRecord[];
  roles: RoleOption[];
  servers: ServerOption[];
  isPending: boolean;
  error: string | null;
  roleAction: RoleAction;
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onClose: () => void;
}) => {
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const editing = target === "new" ? null : target;
  const formId = useId();
  const schema = useMemo(
    () => userDraftSchema(users, editing?.id ?? null),
    [users, editing?.id],
  );
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(schema),
    defaultValues: editing ? toDraft(editing) : emptyDraft(),
  });
  const roleField = editing ? "platformRoleId" : "serverRoleId";
  const serverItems = [
    { value: NO_SERVER, label: "Select a server" },
    ...servers.map((server) => ({ value: server.id, label: server.name })),
  ];
  const roleItems = [
    { value: NO_ROLE, label: editing ? "No role" : "Select a role" },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ];
  return (
    <>
      <DialogHeader icon={UserIcon}>
        <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
        <DialogDescription>
          {editing ? editing.username : "Create an account for a teammate."}
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
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor={`${formId}-username`}>Username</FieldLabel>
              <Input
                id={`${formId}-username`}
                autoComplete="off"
                {...register("username")}
                disabled={!!editing}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <FieldError>{errors.username.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor={`${formId}-email`}>Email</FieldLabel>
              <Input
                id={`${formId}-email`}
                type="email"
                autoComplete="off"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.whatsapp}>
              <FieldLabel htmlFor={`${formId}-whatsapp`}>
                WhatsApp (optional)
              </FieldLabel>
              <Input
                id={`${formId}-whatsapp`}
                placeholder="+628123456789"
                {...register("whatsapp")}
                aria-invalid={!!errors.whatsapp}
              />
              {errors.whatsapp && (
                <FieldError>{errors.whatsapp.message}</FieldError>
              )}
            </Field>
          </DialogSection>
          <DialogDivider />
          <DialogSection>
            {!editing && (
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor={`${formId}-password`}>Password</FieldLabel>
                <PasswordInput
                  id={`${formId}-password`}
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
            )}
            {!editing && (
              <Field data-invalid={!!errors.serverId}>
                <FieldLabel>Server</FieldLabel>
                <Controller
                  control={control}
                  name="serverId"
                  render={({ field }) => (
                    <Pick
                      label="Server"
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
            <Field data-invalid={!!errors.serverRoleId}>
              <FieldLabel>{editing ? "Platform role" : "Role"}</FieldLabel>
              <div className="flex gap-2">
                <Controller
                  control={control}
                  name={roleField}
                  render={({ field }) => (
                    <Pick
                      label="Role"
                      items={roleItems}
                      value={field.value ?? NO_ROLE}
                      onChange={(value) =>
                        field.onChange(value === NO_ROLE ? null : value)
                      }
                      className="flex-1"
                    />
                  )}
                />
                <Button
                  type="button"
                  size="icon"
                  aria-label="New role"
                  title="New role"
                  onClick={() => setIsRoleOpen(true)}
                >
                  <PlusIcon />
                </Button>
              </div>
              {errors.serverRoleId && (
                <FieldError>{errors.serverRoleId.message}</FieldError>
              )}
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </DialogSection>
        </form>
      </DialogBody>
      <DialogToggles>
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <ToggleCard
              id={`${formId}-active`}
              icon={<UserCheckIcon />}
              label="Active"
              description="An inactive user can no longer sign in."
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
          {editing ? "Save" : "Add user"}
        </Button>
      </DialogFooter>
      <RoleFormDialog
        open={isRoleOpen}
        action={roleAction}
        onSave={async (draft) => {
          try {
            const id = await roleAction.create(draft);
            setValue(roleField, id, { shouldDirty: true });
            setIsRoleOpen(false);
          } catch {
            return;
          }
        }}
        onClose={() => {
          setIsRoleOpen(false);
          roleAction.reset();
        }}
      />
    </>
  );
};

export const UserDialog = ({
  target,
  users,
  roles,
  servers,
  isPending,
  error,
  roleAction,
  onSave,
  onClose,
}: {
  target: DialogTarget;
  users: UserRecord[];
  roles: RoleOption[];
  servers: ServerOption[];
  isPending: boolean;
  error: string | null;
  roleAction: RoleAction;
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
            users={users}
            roles={roles}
            servers={servers}
            isPending={isPending}
            error={error}
            roleAction={roleAction}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
