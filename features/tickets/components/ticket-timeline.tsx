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
        .map((event, index, visible) => (
          <li key={event.id} className="relative flex gap-4 pb-4 last:pb-0">
            {index < visible.length - 1 && (
              <span
                aria-hidden
                className="absolute top-3 bottom-0 left-1 w-px bg-border"
              />
            )}
            <span
              aria-hidden
              className="relative mt-1 size-2 shrink-0 rounded-full bg-primary"
            />
            <div className="flex min-w-0 flex-1 items-start justify-between gap-4 text-xs">
              <span className="font-medium">{eventLabel(event.type)}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {formatDateTime(event.createdAt)}
              </span>
            </div>
          </li>
        ))}
    </ol>
  </div>
);
