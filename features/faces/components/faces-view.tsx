"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ScanFaceIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { type DialogTarget, FaceDialog } from "./face-dialog";
import { FaceGroupPanel } from "./face-group-panel";
import { PersonTable } from "./person-table";
import { useFaceActions } from "../hooks/use-face-actions";
import { useFaces } from "../hooks/use-faces";
import {
  countByGroup,
  DEFAULT_FILTERS,
  filterPersons,
  type Filters,
  groupPersons,
} from "../lib/filter-persons";
import type { FacesData, Person } from "../types";

const PAGE_SIZE = 20;

type PendingDelete = { kind: "person" | "group"; persons: Person[] };

export const FacesView = ({
  data,
  isLive,
}: {
  data: FacesData;
  isLive: boolean;
}) => {
  const { data: current } = useFaces(data, isLive);
  const { faces, edges, failures } = current;
  useFailureToast(
    "Some edge servers did not respond",
    failures.map((failure) => `${failure.edgeName}: ${failure.message}`),
  );
  const { save, remove, saveError, removeError } = useFaceActions(isLive);
  useFailureToast("Failed to delete the people", [removeError]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const [pending, setPending] = useState<PendingDelete | null>(null);
  const persons = useMemo(() => groupPersons(faces), [faces]);
  const matches = useMemo(
    () => filterPersons(persons, filters),
    [persons, filters],
  );
  const groups = useMemo(
    () => countByGroup(persons, filters),
    [persons, filters],
  );
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = matches.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const change = (patch: Partial<Filters>) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(0);
  };
  return (
    <PageShell>
      <SidePanel>
        <FaceGroupPanel
          filters={filters}
          edges={edges}
          groups={groups}
          onChange={change}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(0);
          }}
          onDeleteGroup={(group) =>
            setPending({
              kind: "group",
              persons: persons.filter((person) => person.group === group),
            })
          }
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            disabled={edges.length === 0}
            onClick={() => setDialog("new")}
          >
            <PlusIcon />
            Add person
          </Button>
          <div className="flex items-center gap-2">
            <span className="mr-2 text-xs text-muted-foreground tabular-nums">
              {matches.length === 0
                ? "0 people"
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
            icon={<ScanFaceIcon />}
            title={persons.length === 0 ? "No people" : "No people found"}
            description={
              persons.length === 0
                ? "Register the first person."
                : "No people match the filters."
            }
          />
        ) : (
          <div className="flex flex-col overflow-hidden rounded border lg:min-h-0 lg:flex-1">
            <PersonTable
              persons={visible}
              onDelete={(person) =>
                setPending({ kind: "person", persons: [person] })
              }
            />
          </div>
        )}
      </div>
      <FaceDialog
        target={dialog}
        edges={edges}
        groups={groups.map((item) => item.group)}
        isPending={save.isPending}
        error={saveError}
        onClose={() => {
          setDialog(null);
          save.reset();
        }}
        onSave={async (draft) => {
          try {
            await save.mutateAsync(draft);
            setDialog(null);
          } catch {
            return;
          }
        }}
      />
      <ConfirmDialog
        isOpen={pending !== null}
        icon={Trash2Icon}
        variant="destructive"
        title={`Delete this ${pending?.kind === "group" ? "person group" : "person"}?`}
        description={`${
          pending?.kind === "group"
            ? "The people in this group and all their photos are"
            : "This person and all their photos are"
        } removed from the face gallery. They will no longer be recognized.`}
        confirmLabel={
          pending?.kind === "group" ? "Delete person group" : "Delete person"
        }
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          setPending(null);
          remove.mutate(pending.persons);
        }}
      />
    </PageShell>
  );
};
