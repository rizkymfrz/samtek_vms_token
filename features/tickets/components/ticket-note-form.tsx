"use client";
import { useState } from "react";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NOTE_MAX_LENGTH, RESOLUTION_TYPES } from "../schemas/ticket";
import type { TicketAction } from "../types";

export type NoteAction = Extract<
  TicketAction,
  "request-resolution" | "approve" | "reject"
>;

const NOTE_TITLE: Record<NoteAction, string> = {
  "request-resolution": "Request resolution",
  approve: "Approve resolution",
  reject: "Reject resolution",
};

const RESOLUTION_ITEMS = RESOLUTION_TYPES.map((value) => ({
  value,
  label: value === "resolved" ? "Resolved" : "False alarm",
}));

export const TicketNoteForm = ({
  action,
  isPending,
  blockedReason,
  onSubmit,
  onCancel,
}: {
  action: NoteAction;
  isPending: boolean;
  blockedReason?: string | null;
  onSubmit: (body: { type?: string; note?: string }) => void;
  onCancel: () => void;
}) => {
  const [type, setType] = useState<string>("resolved");
  const [note, setNote] = useState("");
  const trimmed = note.trim();
  const isRequired = action !== "approve";
  const isValid = (!isRequired || trimmed.length > 0) && !blockedReason;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{NOTE_TITLE[action]}</span>
      {action === "request-resolution" && (
        <Pick
          label="Outcome"
          items={RESOLUTION_ITEMS}
          value={type}
          onChange={setType}
          className="w-full"
        />
      )}
      <Textarea
        value={note}
        maxLength={NOTE_MAX_LENGTH}
        placeholder={isRequired ? "Note (required)" : "Note (optional)"}
        aria-label="Note"
        onChange={(event) => setNote(event.target.value)}
      />
      {blockedReason && (
        <p className="text-xs text-muted-foreground">{blockedReason}</p>
      )}
      <div className="flex gap-2 *:flex-1">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant={action === "reject" ? "destructive" : "default"}
          disabled={!isValid || isPending}
          onClick={() =>
            onSubmit({
              ...(action === "request-resolution" ? { type } : {}),
              ...(trimmed ? { note: trimmed } : {}),
            })
          }
        >
          {NOTE_TITLE[action]}
        </Button>
      </div>
    </div>
  );
};
