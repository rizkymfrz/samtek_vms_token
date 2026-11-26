import { ServerIcon } from "lucide-react";
import {
  PanelActions,
  PanelEmpty,
  PanelSection,
} from "@/components/layout/side-panel";
import { StatusDot } from "@/components/shared/status-dot";
import { cn } from "@/lib/utils";
import type { ServerRecord } from "../types";

export const ServerListPanel = ({
  servers,
  online,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}: {
  servers: ServerRecord[];
  online: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: () => void;
}) => {
  return (
    <>
      <PanelSection title="Edge servers">
        {servers.length === 0 && (
          <PanelEmpty
            icon={<ServerIcon />}
            title="No edge servers"
            description="Add one to get started."
          />
        )}
        <ul className="flex flex-col gap-2">
          {servers.map((server) => (
            <li key={server.id}>
              <button
                type="button"
                aria-pressed={server.id === selectedId}
                onClick={() => onSelect(server.id)}
                className={cn(
                  "relative flex w-full items-center gap-2 rounded border p-2 text-left outline-none before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-primary before:opacity-0 hover:bg-accent",
                  server.id === selectedId &&
                    "border-transparent bg-accent before:opacity-100",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                  <ServerIcon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium">
                    {server.name}
                  </span>
                </span>
                <StatusDot
                  shape="square"
                  status={online.has(server.id) ? "live" : "offline"}
                  role="img"
                  aria-label={online.has(server.id) ? "Online" : "Offline"}
                />
              </button>
            </li>
          ))}
        </ul>
        <PanelActions
          createLabel="Add edge server"
          deleteLabel="Delete edge server"
          isDeleteDisabled={selectedId === null}
          onCreate={onAdd}
          onDelete={onDelete}
        />
      </PanelSection>
    </>
  );
};
