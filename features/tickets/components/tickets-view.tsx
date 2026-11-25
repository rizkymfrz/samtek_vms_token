"use client";
import { SlidersHorizontalIcon, TicketIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { messageOf } from "@/lib/axios/browser-client";
import { TicketDetailDialog } from "./ticket-detail-dialog";
import { DEFAULT_FILTERS, TicketFilterPanel } from "./ticket-filter-panel";
import { TicketRulesDialog } from "./ticket-rules-dialog";
import { TicketsSkeleton } from "./tickets-skeleton";
import { TicketTable } from "./ticket-table";
import {
  useServerNames,
  useTickets,
  useTicketUpdates,
} from "../hooks/use-tickets";
import type { TicketFilters } from "../types";

const PAGE_SIZE = 20;
const NO_SERVERS: { id: string; name: string }[] = [];

export const TicketsView = () => {
  useTicketUpdates();
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const { data, error, isPending } = useTickets(filters);
  const { data: servers = NO_SERVERS } = useServerNames();
  const { data: user } = useCurrentUser();
  const serverNames = useMemo(
    () => new Map(servers.map((server) => [server.id, server.name])),
    [servers],
  );
  useFailureToast("Failed to load tickets", [error ? messageOf(error) : null]);
  const change = (patch: Partial<TicketFilters>) =>
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  if (isPending) return <TicketsSkeleton />;
  const tickets = data?.items ?? [];
  const total = data?.total ?? 0;
  return (
    <PageShell>
      <SidePanel>
        <TicketFilterPanel
          filters={filters}
          servers={servers}
          userId={user?.id ?? null}
          onChange={change}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsRulesOpen(true)}>
            <SlidersHorizontalIcon />
            Rules
          </Button>
        </div>
        {tickets.length === 0 ? (
          <EmptyState
            icon={<TicketIcon />}
            title="No tickets"
            description={
              error
                ? "Failed to load tickets."
                : "No ticket matches the filters."
            }
          />
        ) : (
          <>
            <div className="flex flex-col overflow-hidden rounded border lg:min-h-0 lg:flex-1">
              <TicketTable
                tickets={tickets}
                serverNames={serverNames}
                onSelect={setSelected}
              />
            </div>
            <Pager
              page={filters.page - 1}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page: page + 1 }))
              }
            />
          </>
        )}
        <TicketDetailDialog
          ticketId={selected}
          serverNames={serverNames}
          userId={user?.id ?? null}
          onClose={() => setSelected(null)}
        />
        <TicketRulesDialog
          isOpen={isRulesOpen}
          servers={servers}
          initialServerId={filters.edgeServerId}
          onClose={() => setIsRulesOpen(false)}
        />
      </div>
    </PageShell>
  );
};
