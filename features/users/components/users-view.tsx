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
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { messageOf } from "@/lib/axios/browser-client";
import { type DialogTarget, UserDialog } from "./user-dialog";
import { UserFilterPanel } from "./user-filter-panel";
import { UserTable } from "./user-table";
import { usePermissions } from "../hooks/use-permissions";
import { useUserActions } from "../hooks/use-user-actions";
import { useUsers } from "../hooks/use-users";
import type { Draft } from "../lib/edit-user";
import {
  countByRole,
  DEFAULT_FILTERS,
  type Filters,
  filterUsers,
} from "../lib/filter-users";
import type { UserRecord, UsersData } from "../types";

const PAGE_SIZE = 20;

export const UsersView = ({
  data,
  isLive,
}: {
  data: UsersData;
  isLive: boolean;
}) => {
  const { data: current } = useUsers(data, isLive);
  const { users, roles, servers, failures } = current;
  useFailureToast(
    "Some data could not be loaded",
    failures.map((failure) => `${failure.source}: ${failure.message}`),
  );
  const { save, addRole, remove, addRoleError, saveError, removeError } =
    useUserActions(isLive);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const permissions = usePermissions(isLive && dialog !== null);
  const [pendingDelete, setPendingDelete] = useState<UserRecord | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  useFailureToast("Saved with a problem", [warning]);
  useFailureToast("Could not delete the user", [removeError]);
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
              onDelete={setPendingDelete}
            />
          </div>
        )}
        <UserDialog
          target={dialog}
          users={users}
          roles={roles}
          servers={servers}
          isPending={save.isPending || remove.isPending}
          error={saveError}
          roleAction={{
            isPending: addRole.isPending,
            error: addRoleError,
            permissions: permissions.data ?? [],
            permissionsError: permissions.error
              ? messageOf(permissions.error)
              : null,
            create: addRole.mutateAsync,
            reset: addRole.reset,
          }}
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
        />
        <DeleteConfirmDialog
          isOpen={pendingDelete !== null}
          title={`Delete ${pendingDelete?.username}?`}
          description="The account can no longer sign in. Its username and email stay reserved."
          confirmLabel="Delete user"
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            if (pendingDelete) remove.mutate(pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      </div>
    </PageShell>
  );
};
