"use client";
import { LayersIcon } from "lucide-react";
import { useId, useState } from "react";
import { Pick } from "@/components/shared/pick";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Floorplan, PlanGroup } from "../types";

export type FloorplanDraft = {
  name: string;
  groupId: string;
  parentId?: string;
};

const NO_PARENT = "none";

const Form = ({
  groups,
  plans,
  initialGroupId,
  isPending,
  error,
  onSave,
  onClose,
}: {
  groups: PlanGroup[];
  plans: Floorplan[];
  initialGroupId: string;
  isPending: boolean;
  error: string | null;
  onSave: (draft: FloorplanDraft) => void;
  onClose: () => void;
}) => {
  const formId = useId();
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState(initialGroupId);
  const [parentId, setParentId] = useState(NO_PARENT);
  const groupItems = groups.map((g) => ({ value: g.id, label: g.name }));
  const parentItems = [
    { value: NO_PARENT, label: "No parent (top level)" },
    ...plans
      .filter((p) => p.groupId === groupId)
      .map((p) => ({ value: p.id, label: p.label })),
  ];
  const trimmed = name.trim();
  return (
    <>
      <DialogHeader icon={LayersIcon}>
        <DialogTitle>Add floor plan</DialogTitle>
        <DialogDescription>
          Create the plan, then upload its image from the side panel.
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
            if (!trimmed) return;
            onSave({
              name: trimmed,
              groupId,
              parentId: parentId === NO_PARENT ? undefined : parentId,
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
                placeholder="Floor 1"
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Group</FieldLabel>
              <Pick
                label="Group"
                items={groupItems}
                value={groupId}
                onChange={(value) => {
                  setGroupId(value);
                  setParentId(NO_PARENT);
                }}
                className="w-full"
              />
            </Field>
            <Field>
              <FieldLabel>Parent plan</FieldLabel>
              <Pick
                label="Parent plan"
                items={parentItems}
                value={parentId}
                onChange={setParentId}
                className="w-full"
              />
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
        <Button type="submit" form={formId} disabled={isPending || !trimmed}>
          Add floor plan
        </Button>
      </DialogFooter>
    </>
  );
};

export const FloorplanFormDialog = ({
  open,
  groups,
  plans,
  initialGroupId,
  isPending,
  error,
  onSave,
  onClose,
}: {
  open: boolean;
  groups: PlanGroup[];
  plans: Floorplan[];
  initialGroupId: string;
  isPending: boolean;
  error: string | null;
  onSave: (draft: FloorplanDraft) => void;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="md">
        {open && (
          <Form
            groups={groups}
            plans={plans}
            initialGroupId={initialGroupId}
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
