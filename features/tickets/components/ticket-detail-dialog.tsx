"use client";
import {
  CheckIcon,
  PlayIcon,
  SendIcon,
  ShieldAlertIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { RiskBadge } from "@/components/shared/risk-badge";
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
import { FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TicketDetailSummary } from "./ticket-detail-summary";
import { TicketEvidence } from "./ticket-evidence";
import { type NoteAction, TicketNoteForm } from "./ticket-note-form";
import { TicketPhoto } from "./ticket-photo";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketTimeline } from "./ticket-timeline";
import { useTicketActions } from "../hooks/use-ticket-actions";
import { useTicketDetail } from "../hooks/use-tickets";
import {
  availableActions,
  canAddEvidence,
  isFinal,
} from "../lib/ticket-status";
import type { TicketAction, TicketDetail } from "../types";

const NO_PHOTO = "Add at least one photo before asking to close the ticket.";

const Body = ({
  ticket,
  serverName,
  userId,
  onClose,
}: {
  ticket: TicketDetail;
  serverName: string;
  userId: string | null;
  onClose: () => void;
}) => {
  const { run, upload, link, error } = useTicketActions();
  const [noteAction, setNoteAction] = useState<NoteAction | null>(null);
  const actions = availableActions(ticket, userId);
  const isAssignee = userId !== null && ticket.assigneeId === userId;
  const canSendLink =
    ticket.assigneeId !== null &&
    !isFinal(ticket.status) &&
    ticket.status !== "resolve_requested";
  const submit = (action: TicketAction, body = {}) =>
    run.mutate(
      { id: ticket.id, action, body },
      { onSuccess: () => setNoteAction(null) },
    );
  return (
    <>
      <DialogHeader icon={ShieldAlertIcon}>
        <div className="flex items-center gap-2">
          <DialogTitle>{ticket.title}</DialogTitle>
          <RiskBadge level={ticket.riskLevel} />
          <TicketStatusBadge status={ticket.status} />
        </div>
        {ticket.description && (
          <DialogDescription>{ticket.description}</DialogDescription>
        )}
      </DialogHeader>
      <Separator />
      <DialogBody>
        <DialogSection className="md:flex-[1.35]">
          <TicketPhoto
            src={ticket.hasImage ? `/api/tickets/${ticket.id}/image` : null}
            alt={`Snapshot of ticket ${ticket.id}`}
            className="w-full"
          />
          <TicketEvidence
            evidence={ticket.evidence}
            canUpload={isAssignee && canAddEvidence(ticket.status)}
            isUploading={upload.isPending}
            onUpload={(file) => upload.mutate({ id: ticket.id, file })}
            renderPhoto={(photoId) => (
              <TicketPhoto
                src={`/api/tickets/${ticket.id}/evidence/${photoId}`}
                alt="Evidence photo"
                className="aspect-square"
              />
            )}
          />
        </DialogSection>
        <DialogDivider />
        <DialogSection>
          <TicketDetailSummary ticket={ticket} serverName={serverName} />
          {ticket.resolutionNote && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {ticket.resolutionType === "false_alarm"
                  ? "False alarm"
                  : "Resolution"}
              </span>
              <p className="text-xs break-words text-muted-foreground">
                {ticket.resolutionNote}
              </p>
            </div>
          )}
          {noteAction && (
            <TicketNoteForm
              key={noteAction}
              action={noteAction}
              isPending={run.isPending}
              blockedReason={
                noteAction === "request-resolution" &&
                ticket.evidence.length === 0
                  ? NO_PHOTO
                  : null
              }
              onSubmit={(body) => submit(noteAction, body)}
              onCancel={() => setNoteAction(null)}
            />
          )}
          <TicketTimeline events={ticket.events} />
          {link.isSuccess && (
            <p className="text-xs text-muted-foreground">
              A new link is on its way to {ticket.assigneeUsername}.
            </p>
          )}
          {error && <FieldError>{error}</FieldError>}
        </DialogSection>
      </DialogBody>
      <Separator />
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {!noteAction && canSendLink && (
          <Button
            variant="secondary"
            disabled={link.isPending}
            onClick={() => link.mutate(ticket.id)}
          >
            <SendIcon />
            Send link
          </Button>
        )}
        {!noteAction && actions.includes("acknowledge") && (
          <Button
            disabled={run.isPending}
            onClick={() => submit("acknowledge")}
          >
            <CheckIcon />
            Acknowledge
          </Button>
        )}
        {!noteAction && actions.includes("start") && (
          <Button disabled={run.isPending} onClick={() => submit("start")}>
            <PlayIcon />
            Start
          </Button>
        )}
        {!noteAction && actions.includes("request-resolution") && (
          <Button
            variant={actions.includes("start") ? "secondary" : "default"}
            onClick={() => setNoteAction("request-resolution")}
          >
            Request resolution
          </Button>
        )}
        {!noteAction && actions.includes("reject") && (
          <Button variant="destructive" onClick={() => setNoteAction("reject")}>
            <XIcon />
            Reject
          </Button>
        )}
        {!noteAction && actions.includes("approve") && (
          <Button onClick={() => setNoteAction("approve")}>
            <CheckIcon />
            Approve
          </Button>
        )}
      </DialogFooter>
    </>
  );
};

export const TicketDetailDialog = ({
  ticketId,
  serverNames,
  userId,
  onClose,
}: {
  ticketId: string | null;
  serverNames: ReadonlyMap<string, string>;
  userId: string | null;
  onClose: () => void;
}) => {
  const { data: ticket, error } = useTicketDetail(ticketId);
  return (
    <Dialog
      open={ticketId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent size="xl">
        {ticket && ticket.id === ticketId ? (
          <Body
            key={ticket.id}
            ticket={ticket}
            serverName={
              serverNames.get(ticket.edgeServerId) ??
              `Server ${ticket.edgeServerId}`
            }
            userId={userId}
            onClose={onClose}
          />
        ) : (
          <>
            <DialogHeader icon={ShieldAlertIcon}>
              <DialogTitle>Ticket</DialogTitle>
              <DialogDescription>
                {error ? "The ticket could not be loaded." : "Loading…"}
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <DialogBody>
              <DialogSection>
                <div className="flex justify-center py-8">
                  {error ? (
                    <Button variant="secondary" onClick={onClose}>
                      Close
                    </Button>
                  ) : (
                    <Spinner />
                  )}
                </div>
              </DialogSection>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
