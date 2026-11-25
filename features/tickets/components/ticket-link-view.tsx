"use client";
import { isAxiosError } from "axios";
import { CheckIcon, LinkIcon, PlayIcon, ShieldAlertIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogSection,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkPhoto } from "./link-photo";
import { TicketDetailSummary } from "./ticket-detail-summary";
import { TicketEvidence } from "./ticket-evidence";
import { type NoteAction, TicketNoteForm } from "./ticket-note-form";
import { TicketResolutionNote } from "./ticket-resolution-note";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketTimeline } from "./ticket-timeline";
import {
  useLinkActions,
  useLinkTicket,
  useLinkToken,
} from "../hooks/use-ticket-link";
import { availableActions, canAddEvidence } from "../lib/ticket-status";
import type { TicketDetail } from "../types";

const NO_PHOTO = "Add at least one photo before asking to close the ticket.";
const GONE_STATUS = 410;

const Gone = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="mx-auto flex min-h-svh max-w-xl items-center p-4">
    <EmptyState
      icon={<LinkIcon />}
      title={title}
      description={description}
      className="w-full"
    />
  </div>
);

const Ticket = ({ ticket }: { ticket: TicketDetail }) => {
  const { run, upload, error } = useLinkActions();
  const [noteAction, setNoteAction] = useState<NoteAction | null>(null);
  const actions = availableActions(ticket, ticket.assigneeId).filter(
    (action) =>
      action === "acknowledge" ||
      action === "start" ||
      action === "request-resolution",
  );
  const hasActions = !noteAction && actions.length > 0;
  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-4">
      <div className="flex w-full flex-col overflow-hidden rounded border border-border bg-popover text-xs/relaxed text-popover-foreground md:max-w-6xl">
        <DialogHeader icon={ShieldAlertIcon} className="pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-sm font-medium">{ticket.title}</h1>
            <RiskBadge level={ticket.riskLevel} />
            <TicketStatusBadge status={ticket.status} />
          </div>
          {ticket.description && (
            <p className="text-xs/relaxed text-muted-foreground">
              {ticket.description}
            </p>
          )}
        </DialogHeader>
        <Separator />
        <DialogBody>
          <DialogSection className="md:flex-[1.35]">
            <LinkPhoto
              path="/image"
              alt={`Snapshot of ticket ${ticket.id}`}
              className="w-full"
            />
            <TicketEvidence
              evidence={ticket.evidence}
              canUpload={canAddEvidence(ticket.status)}
              isUploading={upload.isPending}
              isCameraOnly
              onUpload={(file) => upload.mutate(file)}
              renderPhoto={(photoId) => (
                <LinkPhoto
                  path={`/evidence/${photoId}`}
                  alt="Evidence photo"
                  className="aspect-square"
                />
              )}
            />
          </DialogSection>
          <DialogDivider />
          <DialogSection>
            <TicketDetailSummary ticket={ticket} />
            <TicketResolutionNote ticket={ticket} />
            {ticket.status === "resolve_requested" && (
              <p className="text-xs text-muted-foreground">
                Waiting for a supervisor to approve or reject the resolution.
              </p>
            )}
            {noteAction === "request-resolution" && (
              <TicketNoteForm
                action={noteAction}
                isPending={run.isPending}
                blockedReason={ticket.evidence.length === 0 ? NO_PHOTO : null}
                onSubmit={(body) =>
                  run.mutate(
                    { action: noteAction, body },
                    { onSuccess: () => setNoteAction(null) },
                  )
                }
                onCancel={() => setNoteAction(null)}
              />
            )}
            <TicketTimeline events={ticket.events} />
            {error && <FieldError>{error}</FieldError>}
          </DialogSection>
        </DialogBody>
        {hasActions && (
          <>
            <Separator />
            <DialogFooter>
              {actions.includes("acknowledge") && (
                <Button
                  disabled={run.isPending}
                  onClick={() => run.mutate({ action: "acknowledge" })}
                >
                  <CheckIcon />
                  Acknowledge
                </Button>
              )}
              {actions.includes("start") && (
                <Button
                  disabled={run.isPending}
                  onClick={() => run.mutate({ action: "start" })}
                >
                  <PlayIcon />
                  Start
                </Button>
              )}
              {actions.includes("request-resolution") && (
                <Button
                  variant={actions.includes("start") ? "secondary" : "default"}
                  onClick={() => setNoteAction("request-resolution")}
                >
                  Request resolution
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </div>
    </main>
  );
};

export const TicketLinkView = () => {
  const state = useLinkToken();
  const token = state.status === "ready" ? state.token : null;
  const { data: ticket, error } = useLinkTicket(token !== null);
  if (state.status === "pending") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 lg:p-8">
        <Skeleton className="h-8" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  if (!token) {
    return (
      <Gone
        title="This link is incomplete"
        description="Open the full link from the WhatsApp message."
      />
    );
  }
  if (isAxiosError(error) && error.response?.status === GONE_STATUS) {
    return (
      <Gone
        title="This link is no longer active"
        description="The ticket was closed or handed to someone else. Ask your supervisor to send a new link if you still need it."
      />
    );
  }
  if (error) {
    return (
      <Gone
        title="Failed to load the ticket"
        description="Check your connection and reload the page."
      />
    );
  }
  if (!ticket) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 lg:p-8">
        <Skeleton className="h-8" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  return <Ticket ticket={ticket} />;
};
