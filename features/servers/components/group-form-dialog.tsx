"use client";
import { FolderPlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const CODE_PATTERN = /^[A-Za-z0-9._-]+$/;

const slugOf = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Form = ({
  isPending,
  error,
  onSave,
  onClose,
}: {
  isPending: boolean;
  error: string | null;
  onSave: (draft: { name: string; code: string }) => void;
  onClose: () => void;
}) => {
  const formId = useId();
  const [name, setName] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const shownCode = code ?? slugOf(name);
  const trimmed = name.trim();
  const codeInvalid = shownCode !== "" && !CODE_PATTERN.test(shownCode);
  return (
    <>
      <DialogHeader icon={FolderPlusIcon}>
        <DialogTitle>Add group</DialogTitle>
        <DialogDescription>
          Servers and floor plans are organized by group.
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
            if (trimmed && shownCode && !codeInvalid)
              onSave({ name: trimmed, code: shownCode });
          }}
        >
          <DialogSection>
            <Field>
              <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
              <Input
                id={`${formId}-name`}
                value={name}
                maxLength={100}
                placeholder="Cabang Jakarta"
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field data-invalid={codeInvalid}>
              <FieldLabel htmlFor={`${formId}-code`}>Code</FieldLabel>
              <Input
                id={`${formId}-code`}
                value={shownCode}
                maxLength={100}
                placeholder="jakarta"
                aria-invalid={codeInvalid}
                onChange={(event) => setCode(event.target.value)}
              />
              {codeInvalid ? (
                <FieldError>
                  Use letters, digits, dot, underscore or dash only.
                </FieldError>
              ) : (
                <FieldDescription>
                  Unique, and cannot be changed later.
                </FieldDescription>
              )}
            </Field>
            {error && <FieldError>{error}</FieldError>}
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
          disabled={isPending || !trimmed || !shownCode || codeInvalid}
        >
          Add group
        </Button>
      </DialogFooter>
    </>
  );
};

export const GroupFormDialog = ({
  open,
  isPending,
  error,
  onSave,
  onClose,
}: {
  open: boolean;
  isPending: boolean;
  error: string | null;
  onSave: (draft: { name: string; code: string }) => void;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="sm">
        {open && (
          <Form
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
