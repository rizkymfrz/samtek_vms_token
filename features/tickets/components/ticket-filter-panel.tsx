import { ServerIcon, UserIcon } from "lucide-react";
import {
  PanelField,
  PanelOption,
  PanelReset,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { STATUS_LABEL } from "../lib/ticket-status";
import { TICKET_STATUSES } from "../schemas/ticket";
import type { TicketFilters } from "../types";

const ALL = "all";

export const DEFAULT_FILTERS: TicketFilters = {
  status: null,
  edgeServerId: null,
  assigneeId: null,
  page: 1,
};

export const TicketFilterPanel = ({
  filters,
  servers,
  userId,
  onChange,
  onClear,
}: {
  filters: TicketFilters;
  servers: { id: string; name: string }[];
  userId: string | null;
  onChange: (patch: Partial<TicketFilters>) => void;
  onClear: () => void;
}) => {
  const serverItems = [
    { value: ALL, label: "All edge servers" },
    ...servers.map((server) => ({ value: server.id, label: server.name })),
  ];
  const isFiltered =
    filters.status !== null ||
    filters.edgeServerId !== null ||
    filters.assigneeId !== null;
  return (
    <>
      <PanelSection title="Filters">
        <PanelField label="Edge server">
          <Pick
            label="Edge server"
            icon={ServerIcon}
            items={serverItems}
            value={filters.edgeServerId ?? ALL}
            onChange={(value) =>
              onChange({ edgeServerId: value === ALL ? null : value })
            }
            className="w-full"
          />
        </PanelField>
        <PanelField label="Assignee">
          <Pick
            label="Assignee"
            icon={UserIcon}
            items={[
              { value: ALL, label: "Everyone" },
              { value: "me", label: "Assigned to me" },
            ]}
            value={filters.assigneeId ? "me" : ALL}
            onChange={(value) =>
              onChange({ assigneeId: value === "me" ? userId : null })
            }
            className="w-full"
          />
        </PanelField>
        <PanelReset isDisabled={!isFiltered} onClick={onClear} />
      </PanelSection>
      <PanelSection title="Status">
        <ul className="flex flex-col">
          {[null, ...TICKET_STATUSES].map((status) => {
            const selected = filters.status === status;
            return (
              <li key={status ?? ALL}>
                <PanelOption
                  isSelected={selected}
                  onClick={() => onChange({ status: selected ? null : status })}
                >
                  {status ? STATUS_LABEL[status] : "All statuses"}
                </PanelOption>
              </li>
            );
          })}
        </ul>
      </PanelSection>
    </>
  );
};
