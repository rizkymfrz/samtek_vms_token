import {
  CctvIcon,
  ClockIcon,
  ScanSearchIcon,
  ServerIcon,
  SquareDashedIcon,
  UserIcon,
} from "lucide-react";
import {
  DetailField,
  DetailIdBox,
  DetailLabel,
  DetailRow,
} from "@/components/shared/detail-fields";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "../lib/ticket-status";
import type { TicketRecord } from "../types";

export const TicketDetailSummary = ({
  ticket,
  serverName,
}: {
  ticket: TicketRecord;
  serverName: string;
}) => (
  <>
    <div className="flex flex-col gap-2">
      <DetailLabel>Summary</DetailLabel>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <DetailField icon={CctvIcon} label="Camera" value={ticket.deviceName} />
        <DetailField icon={ServerIcon} label="Server" value={serverName} />
        <DetailField
          icon={ScanSearchIcon}
          label="Analytic"
          value={`${ticket.analyticId} / ${ticket.kind}`}
        />
        <DetailField
          icon={SquareDashedIcon}
          label="Perimeter"
          value={ticket.perimeterName ?? "—"}
        />
        <DetailField
          icon={UserIcon}
          label="Assignee"
          value={ticket.assigneeUsername ?? "Unassigned"}
        />
        <DetailField
          icon={ClockIcon}
          label="First alarm"
          value={formatDateTime(ticket.firstAlertAt)}
        />
        <DetailField
          icon={ClockIcon}
          label="Last alarm"
          value={formatDateTime(ticket.lastAlertAt)}
        />
      </div>
    </div>
    {(ticket.ackDeadlineAt || ticket.reassignCount > 0) && (
      <div className="flex flex-col">
        <DetailLabel>Details</DetailLabel>
        {ticket.ackDeadlineAt && (
          <DetailRow
            label="Acknowledge before"
            value={formatDateTime(ticket.ackDeadlineAt)}
          />
        )}
        {ticket.reassignCount > 0 && (
          <DetailRow label="Reassigned" value={`${ticket.reassignCount}×`} />
        )}
      </div>
    )}
    {ticket.escalatedAt && !ticket.acknowledgedAt && (
      <Badge variant="destructive">
        No officer acknowledged. A supervisor needs to step in.
      </Badge>
    )}
    <DetailIdBox
      label="Ticket ID"
      value={`#${ticket.id}`}
      copyLabel="Copy ticket ID"
    />
  </>
);
