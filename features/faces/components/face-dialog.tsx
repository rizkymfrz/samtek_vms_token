"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScanFaceIcon } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CreatableCombobox } from "@/components/shared/creatable-combobox";
import { ImageCropper } from "@/components/shared/image-cropper";
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
import {
  DEFAULT_GROUP,
  type Draft,
  emptyDraft,
  faceDraftSchema,
} from "../lib/edit-face";
import { GROUP_MAX } from "../schemas/face";
import type { EdgeOption } from "../types";

export type DialogTarget = "new" | null;

const Form = ({
  edges,
  groups,
  isPending,
  error,
  onSave,
  onClose,
}: {
  edges: EdgeOption[];
  groups: string[];
  isPending: boolean;
  error: string | null;
  onSave: (draft: Draft) => void | Promise<void>;
  onClose: () => void;
}) => {
  const formId = useId();
  const [source, setSource] = useState<File | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(faceDraftSchema),
    defaultValues: emptyDraft(edges[0]?.id ?? ""),
  });
  const edgeItems = edges.map((edge) => ({ value: edge.id, label: edge.name }));
  return (
    <>
      <DialogHeader icon={ScanFaceIcon}>
        <DialogTitle>Add face</DialogTitle>
        <DialogDescription>
          Register a person from one photo with exactly one face.
        </DialogDescription>
      </DialogHeader>
      <Separator />
      <DialogBody>
        <form
          id={formId}
          noValidate
          className="contents"
          onSubmit={handleSubmit((draft) => onSave(draft))}
        >
          <DialogSection>
            {edges.length > 1 && (
              <Field data-invalid={!!errors.edgeId}>
                <FieldLabel>Edge server</FieldLabel>
                <Controller
                  control={control}
                  name="edgeId"
                  render={({ field }) => (
                    <Pick
                      label="Edge server"
                      items={edgeItems}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                  )}
                />
                {errors.edgeId && (
                  <FieldError>{errors.edgeId.message}</FieldError>
                )}
              </Field>
            )}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
              <Input
                id={`${formId}-name`}
                autoComplete="off"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.group}>
              <FieldLabel htmlFor={`${formId}-group`}>
                Group (optional)
              </FieldLabel>
              <Controller
                control={control}
                name="group"
                render={({ field }) => (
                  <CreatableCombobox
                    id={`${formId}-group`}
                    options={groups}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={DEFAULT_GROUP}
                    maxLength={GROUP_MAX}
                    emptyLabel={(typed) =>
                      typed ? `Create group "${typed}"` : "No groups yet."
                    }
                    aria-invalid={!!errors.group}
                  />
                )}
              />
              {errors.group && <FieldError>{errors.group.message}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.photo}>
              <FieldLabel htmlFor={`${formId}-photo`}>Photo (JPEG)</FieldLabel>
              <Controller
                control={control}
                name="photo"
                render={({ field }) => (
                  <Input
                    id={`${formId}-photo`}
                    type="file"
                    accept="image/jpeg"
                    onChange={(event) => {
                      const next = event.target.files?.[0] ?? null;
                      setSource(next);
                      field.onChange(next);
                    }}
                    aria-invalid={!!errors.photo}
                  />
                )}
              />
              {errors.photo && <FieldError>{errors.photo.message}</FieldError>}
            </Field>
            {source && (
              <Controller
                control={control}
                name="photo"
                render={({ field }) => (
                  <ImageCropper
                    key={`${source.name}-${source.size}-${source.lastModified}`}
                    file={source}
                    onChange={field.onChange}
                  />
                )}
              />
            )}
            {error && <FieldError>{error}</FieldError>}
          </DialogSection>
        </form>
      </DialogBody>
      <Separator />
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isPending}>
          Add face
        </Button>
      </DialogFooter>
    </>
  );
};

export const FaceDialog = ({
  target,
  edges,
  groups,
  isPending,
  error,
  onSave,
  onClose,
}: {
  target: DialogTarget;
  edges: EdgeOption[];
  groups: string[];
  isPending: boolean;
  error: string | null;
  onSave: (draft: Draft) => void | Promise<void>;
  onClose: () => void;
}) => {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {target && (
          <Form
            edges={edges}
            groups={groups}
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
