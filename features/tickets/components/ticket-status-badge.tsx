import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_VARIANT } from "../lib/ticket-status";
import type { TicketStatus } from "../types";

export const TicketStatusBadge = ({ status }: { status: TicketStatus }) => (
  <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
);
