import { eventLabel, formatDateTime } from "../lib/ticket-status";
import type { TicketDetail } from "../types";

const HIDDEN_EVENT = "merged";

export const TicketTimeline = ({
  events,
}: {
  events: TicketDetail["events"];
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium">Timeline</span>
    <ol className="flex flex-col">
      {events
        .filter((event) => event.type !== HIDDEN_EVENT)
        .map((event) => (
          <li
            key={event.id}
            className="flex items-start justify-between gap-4 border-b py-2 text-xs last:border-b-0"
          >
            <span className="font-medium">{eventLabel(event.type)}</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {formatDateTime(event.createdAt)}
            </span>
          </li>
        ))}
    </ol>
  </div>
);
