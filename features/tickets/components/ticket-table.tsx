import {
  ActivityIcon,
  CctvIcon,
  ClockIcon,
  ShieldAlertIcon,
  UserIcon,
} from "lucide-react";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketStatusBadge } from "./ticket-status-badge";
import { formatShortDateTime } from "../lib/ticket-status";
import type { TicketRecord } from "../types";

export const TicketTable = ({
  tickets,
  serverNames,
  onSelect,
}: {
  tickets: TicketRecord[];
  serverNames: ReadonlyMap<string, string>;
  onSelect: (id: string) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead icon={ShieldAlertIcon}>Ticket</TableHead>
        <TableHead icon={CctvIcon}>Camera</TableHead>
        <TableHead icon={ActivityIcon}>Status</TableHead>
        <TableHead icon={UserIcon}>Assignee</TableHead>
        <TableHead icon={ClockIcon}>Last alarm</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tickets.map((ticket) => (
        <TableRow
          key={ticket.id}
          tabIndex={0}
          onClick={() => onSelect(ticket.id)}
          onKeyDown={(event) =>
            event.target === event.currentTarget &&
            event.key === "Enter" &&
            onSelect(ticket.id)
          }
          className="cursor-pointer outline-none focus-visible:bg-muted"
        >
          <TableCell>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{ticket.title}</span>
                <RiskBadge level={ticket.riskLevel} />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col">
              <span>{ticket.deviceName}</span>
              <span className="text-muted-foreground">
                {serverNames.get(ticket.edgeServerId) ??
                  `Edge server ${ticket.edgeServerId}`}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <TicketStatusBadge status={ticket.status} />
              {ticket.escalatedAt && !ticket.acknowledgedAt && (
                <Badge variant="destructive">Escalated</Badge>
              )}
            </div>
          </TableCell>
          <TableCell>
            {ticket.assigneeUsername ?? (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </TableCell>
          <TableCell className="text-muted-foreground tabular-nums">
            {formatShortDateTime(ticket.lastAlertAt)}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
