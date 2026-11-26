"use client";
import { FileAudioIcon } from "lucide-react";
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
import { AUDIO_ACCEPT, audioFileProblem } from "../lib/audio-files";
import { AUDIO_NAME_MAX } from "../schemas/audio";
import type { ServerOption } from "../types";

const Form = ({
  servers,
  defaultServerId,
  isPending,
  error,
  onSave,
  onClose,
}: {
  servers: ServerOption[];
  defaultServerId: string;
  isPending: boolean;
  error: string | null;
  onSave: (edgeId: string, file: File, name: string) => void | Promise<void>;
  onClose: () => void;
}) => {
  const formId = useId();
  const [edgeId, setEdgeId] = useState(defaultServerId);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const items = servers.map((server) => ({
    value: server.id,
    label: server.name,
  }));
  return (
    <>
      <DialogHeader icon={FileAudioIcon}>
        <DialogTitle>Upload audio</DialogTitle>
        <DialogDescription>
          Upload a WAV or MP3 file to an edge server, up to 5 MB.
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
            const found = audioFileProblem(file);
            setProblem(found);
            if (!found && file) void onSave(edgeId, file, name.trim());
          }}
        >
          <DialogSection>
            {servers.length > 1 && (
              <Field>
                <FieldLabel>Edge server</FieldLabel>
                <Pick
                  label="Edge server"
                  items={items}
                  value={edgeId}
                  onChange={setEdgeId}
                  className="w-full"
                />
              </Field>
            )}
            <Field data-invalid={!!problem}>
              <FieldLabel htmlFor={`${formId}-file`}>Audio file</FieldLabel>
              <Input
                id={`${formId}-file`}
                type="file"
                accept={AUDIO_ACCEPT}
                aria-invalid={!!problem}
                onChange={(event) => {
                  const next = event.target.files?.[0] ?? null;
                  setFile(next);
                  setProblem(null);
                  if (next && !name) setName(next.name.replace(/\.[^.]+$/, ""));
                }}
              />
              {problem && <FieldError>{problem}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-name`}>
                Name (optional)
              </FieldLabel>
              <Input
                id={`${formId}-name`}
                autoComplete="off"
                maxLength={AUDIO_NAME_MAX}
                placeholder="e.g. Gate warning"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
        <Button type="submit" form={formId} disabled={isPending}>
          {isPending ? "Uploading…" : "Upload"}
        </Button>
      </DialogFooter>
    </>
  );
};

export const AudioDialog = ({
  isOpen,
  servers,
  defaultServerId,
  isPending,
  error,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  servers: ServerOption[];
  defaultServerId: string;
  isPending: boolean;
  error: string | null;
  onSave: (edgeId: string, file: File, name: string) => void | Promise<void>;
  onClose: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent size="md">
      {isOpen && (
        <Form
          servers={servers}
          defaultServerId={defaultServerId}
          isPending={isPending}
          error={error}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </DialogContent>
  </Dialog>
);
