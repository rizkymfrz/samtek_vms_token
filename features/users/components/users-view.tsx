"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type DialogTarget, UserDialog } from "./user-dialog";
import { UserTable } from "./user-table";
import { useUserActions } from "../hooks/use-user-actions";
import { useUsers } from "../hooks/use-users";
import type { Draft } from "../lib/edit-user";
import type { UsersData } from "../types";

const PAGE_SIZE = 20;

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

export const UsersView = ({
  data,
  isLive,
}: {
  data: UsersData;
  isLive: boolean;
}) => {
  const { data: current } = useUsers(data, isLive);
  const { users, roles, failures } = current;
  const { save, remove, saveError, removeError } = useUserActions(isLive);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter(
      (user) =>
        (status === "all" || user.isActive === (status === "active")) &&
        (!needle ||
          `${user.username} ${user.email}`.toLowerCase().includes(needle)),
    );
  }, [users, query, status]);
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = matches.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  return (
    <div className="flex flex-col gap-4 p-4">
      {failures.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Some data could not be loaded</AlertTitle>
          <AlertDescription>
            {failures
              .map((failure) => `${failure.source}: ${failure.message}`)
              .join(" · ")}
          </AlertDescription>
        </Alert>
      )}
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
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setDialog("new")}>
            <PlusIcon />
            Add user
          </Button>
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search users..."
            aria-label="Search users"
            className="w-64"
          />
          <Pick
            label="Status"
            items={STATUS_ITEMS}
            value={status}
            onChange={(next) => {
              setStatus(next);
              setPage(0);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 text-xs text-muted-foreground tabular-nums">
            {matches.length === 0
              ? "0 users"
              : `${safePage * PAGE_SIZE + 1}–${Math.min((safePage + 1) * PAGE_SIZE, matches.length)} of ${matches.length}`}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
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
        <div className="overflow-hidden rounded border">
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
  );
};
