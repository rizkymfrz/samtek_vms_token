"use client";
import { BookmarkIcon } from "lucide-react";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Form = ({
  isPending,
  onSave,
  onClose,
}: {
  isPending: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
}) => {
  const formId = useId();
  const [name, setName] = useState("");
  const trimmed = name.trim();
  return (
    <>
      <DialogHeader icon={BookmarkIcon}>
        <DialogTitle>Add preset</DialogTitle>
        <DialogDescription>
          Save the current position of the camera as a preset.
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
            if (trimmed) onSave(trimmed);
          }}
        >
          <DialogSection>
            <Field>
              <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
              <Input
                id={`${formId}-name`}
                value={name}
                maxLength={64}
                placeholder="e.g. Gate"
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
          </DialogSection>
        </form>
      </DialogBody>
      <Separator />
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isPending || !trimmed}>
          Add preset
        </Button>
      </DialogFooter>
    </>
  );
};

export const PtzPresetDialog = ({
  open,
  isPending,
  onSave,
  onClose,
}: {
  open: boolean;
  isPending: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
}) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent size="sm">
      {open && <Form isPending={isPending} onSave={onSave} onClose={onClose} />}
    </DialogContent>
  </Dialog>
);
