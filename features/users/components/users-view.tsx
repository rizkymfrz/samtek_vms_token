"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { type DialogTarget, UserDialog } from "./user-dialog";
import { UserFilterPanel } from "./user-filter-panel";
import { UserTable } from "./user-table";
import { useUserActions } from "../hooks/use-user-actions";
import { useUsers } from "../hooks/use-users";
import type { Draft } from "../lib/edit-user";
import {
  countByRole,
  DEFAULT_FILTERS,
  type Filters,
  filterUsers,
} from "../lib/filter-users";
import type { UsersData } from "../types";

const PAGE_SIZE = 20;

export const UsersView = ({
  data,
  isLive,
}: {
  data: UsersData;
  isLive: boolean;
}) => {
  const { data: current } = useUsers(data, isLive);
  const { users, roles, failures } = current;
  useFailureToast(
    "Some data could not be loaded",
    failures.map((failure) => `${failure.source}: ${failure.message}`),
  );
  const { save, remove, saveError, removeError } = useUserActions(isLive);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const matches = useMemo(() => filterUsers(users, filters), [users, filters]);
  const counts = useMemo(() => countByRole(users, filters), [users, filters]);
  const change = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  };
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = matches.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  return (
    <PageShell>
      <SidePanel>
        <UserFilterPanel
          filters={filters}
          roles={roles}
          counts={counts}
          onChange={change}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(0);
          }}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        {warning && (
          <Alert variant="destructive">
            <AlertTitle>Saved with a problem</AlertTitle>
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        )}
        {removeError && (
          <Alert variant="destructive">
            <AlertTitle>Could not delete the user</AlertTitle>
            <AlertDescription>{removeError}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={() => setDialog("new")}>
            <PlusIcon />
            Add user
          </Button>
          <div className="flex items-center gap-2">
            <span className="mr-2 text-xs text-muted-foreground tabular-nums">
              {matches.length === 0
                ? "0 users"
                : `${safePage * PAGE_SIZE + 1}–${Math.min((safePage + 1) * PAGE_SIZE, matches.length)} of ${matches.length}`}
            </span>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous page"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next page"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        {matches.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title={users.length === 0 ? "No users yet" : "No users found"}
            description={
              users.length === 0
                ? "Add the first one."
                : "No users match the filters."
            }
          />
        ) : (
          <div className="flex flex-col overflow-hidden rounded border lg:min-h-0 lg:flex-1">
            <UserTable
              users={visible}
              roles={roles}
              onSelect={(id) =>
                setDialog(users.find((user) => user.id === id) ?? null)
              }
            />
          </div>
        )}
        <UserDialog
          target={dialog}
          users={users}
          roles={roles}
          isPending={save.isPending || remove.isPending}
          error={saveError}
          onClose={() => {
            setDialog(null);
            save.reset();
          }}
          onSave={async (draft: Draft, id) => {
            try {
              const result = await save.mutateAsync({ draft, id });
              setWarning(result.warning);
              setDialog(null);
            } catch {
              return;
            }
          }}
          onDelete={async (id) => {
            try {
              await remove.mutateAsync(id);
              setDialog(null);
            } catch {
              setDialog(null);
            }
          }}
        />
      </div>
    </PageShell>
  );
};
