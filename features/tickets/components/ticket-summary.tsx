import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "../lib/ticket-status";
import type { TicketRecord } from "../types";

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b py-2 text-xs last:border-b-0">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="text-right font-medium break-words">{value}</span>
  </div>
);

export const TicketSummary = ({
  ticket,
  serverName,
  image,
}: {
  ticket: TicketRecord;
  serverName?: string;
  image: ReactNode;
}) => (
  <>
    {image}
    <div className="flex flex-col">
      <Row label="Ticket" value={`#${ticket.id}`} />
      <Row label="Camera" value={ticket.deviceName} />
      {serverName && <Row label="Server" value={serverName} />}
      <Row label="Analytic" value={`${ticket.analyticId} / ${ticket.kind}`} />
      <Row label="Perimeter" value={ticket.perimeterName ?? "—"} />
      <Row label="First alarm" value={formatDateTime(ticket.firstAlertAt)} />
      <Row label="Last alarm" value={formatDateTime(ticket.lastAlertAt)} />
      <Row label="Assignee" value={ticket.assigneeUsername ?? "Unassigned"} />
      {ticket.ackDeadlineAt && (
        <Row
          label="Acknowledge before"
          value={formatDateTime(ticket.ackDeadlineAt)}
        />
      )}
      {ticket.reassignCount > 0 && (
        <Row label="Reassigned" value={`${ticket.reassignCount}×`} />
      )}
    </div>
    {ticket.escalatedAt && !ticket.acknowledgedAt && (
      <Badge variant="destructive">
        No officer acknowledged. A supervisor needs to step in.
      </Badge>
    )}
  </>
);
