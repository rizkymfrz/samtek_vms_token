"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useId, useMemo, useState } from "react";
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
import {
  type Draft,
  emptyDraft,
  toDraft,
  userDraftSchema,
} from "../lib/edit-user";
import type { RoleOption, UserRecord } from "../types";

export type SheetTarget = "new" | UserRecord | null;

const NO_ROLE = "none";

const Form = ({
  target,
  users,
  roles,
  isPending,
  error,
  onSave,
  onDelete,
  onClose,
}: {
  target: "new" | UserRecord;
  users: UserRecord[];
  roles: RoleOption[];
  isPending: boolean;
  error: string | null;
  onSave: (draft: Draft, id: string | null) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onClose: () => void;
}) => {
  const editing = target === "new" ? null : target;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const formId = useId();
  const schema = useMemo(
    () => userDraftSchema(users, editing?.id ?? null),
    [users, editing?.id],
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
  const roleItems = [
    { value: NO_ROLE, label: "No role" },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ];
  return (
    <>
      <SheetHeader>
        <SheetTitle>{editing ? "Edit user" : "Add user"}</SheetTitle>
        <SheetDescription>
          {editing ? editing.username : "Create an account for a teammate."}
        </SheetDescription>
      </SheetHeader>
      <form
        id={formId}
        noValidate
        className="flex flex-col gap-4 p-4 pt-0"
        onSubmit={handleSubmit((draft) => onSave(draft, editing?.id ?? null))}
      >
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
        {!editing && (
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor={`${formId}-password`}>Password</FieldLabel>
            <Input
              id={`${formId}-password`}
              type="password"
              autoComplete="new-password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>
        )}
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Controller
            control={control}
            name="platformRoleId"
            render={({ field }) => (
              <Pick
                label="Role"
                items={roleItems}
                value={field.value ?? NO_ROLE}
                onChange={(value) =>
                  field.onChange(value === NO_ROLE ? null : value)
                }
                className="w-full"
              />
            )}
          />
        </Field>
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
        {error && <FieldError>{error}</FieldError>}
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
            {editing ? "Save" : "Add user"}
          </Button>
        </div>
      </SheetFooter>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {editing?.username}?</AlertDialogTitle>
            <AlertDialogDescription>
              The account can no longer sign in. Its username and email stay
              reserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => editing && onDelete(editing.id)}
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const UserSheet = ({
  target,
  users,
  roles,
  isPending,
  error,
  onSave,
  onDelete,
  onClose,
}: {
  target: SheetTarget;
  users: UserRecord[];
  roles: RoleOption[];
  isPending: boolean;
  error: string | null;
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
            users={users}
            roles={roles}
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
