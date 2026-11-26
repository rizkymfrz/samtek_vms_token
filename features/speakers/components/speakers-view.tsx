"use client";
import { PlusIcon, Trash2Icon, Volume2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { AudioPanel } from "./audio-panel";
import { CallsPanel } from "./calls-panel";
import { type DialogTarget, SpeakerDialog } from "./speaker-dialog";
import { SpeakerFilterPanel } from "./speaker-filter-panel";
import { SpeakerTable } from "./speaker-table";
import { useSpeakerActions } from "../hooks/use-speaker-actions";
import { useSpeakers } from "../hooks/use-speakers";
import {
  countByServer,
  DEFAULT_FILTERS,
  type Filters,
  filterSpeakers,
} from "../lib/filter-speakers";
import type { SpeakerRecord, SpeakersData } from "../types";

const PAGE_SIZE = 20;

type Tab = "speakers" | "audio" | "history";

export const SpeakersView = ({ data }: { data: SpeakersData }) => {
  const { data: current } = useSpeakers(data);
  const { speakers, servers, failures } = current;
  useFailureToast(
    "Some data did not load",
    failures.map((failure) => `${failure.source}: ${failure.message}`),
  );
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<Tab>("speakers");
  const { save, remove, test, saveError, removeError, testError } =
    useSpeakerActions();
  const [dialog, setDialog] = useState<DialogTarget>(null);
  const [pendingDelete, setPendingDelete] = useState<SpeakerRecord | null>(
    null,
  );
  useFailureToast("Failed to delete the speaker", [removeError]);
  useFailureToast("Failed to test the speaker", [testError]);
  const runTest = (speaker: SpeakerRecord) =>
    test.mutate(speaker, {
      onSuccess: (calls) => {
        const call = calls[0];
        const isPlayed = call?.status === "success";
        toast.add({
          title: isPlayed
            ? `${speaker.name} played the test tone`
            : `${speaker.name} did not play the test tone`,
          description: isPlayed ? undefined : (call?.reason ?? call?.status),
          type: isPlayed ? "success" : "warning",
        });
      },
    });
  const matches = useMemo(
    () => filterSpeakers(speakers, filters),
    [speakers, filters],
  );
  const counts = useMemo(
    () => countByServer(speakers, filters),
    [speakers, filters],
  );
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
      {tab === "speakers" && (
        <SidePanel>
          <SpeakerFilterPanel
            filters={filters}
            servers={servers}
            counts={counts}
            onChange={change}
            onClear={() => {
              setFilters(DEFAULT_FILTERS);
              setPage(0);
            }}
          />
        </SidePanel>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        <Tabs value={tab} onValueChange={(next) => setTab(next as Tab)}>
          <TabsList variant="line">
            <TabsTrigger value="speakers">Speakers</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="history">Play history</TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "audio" && <AudioPanel servers={servers} />}
        {tab === "history" && (
          <CallsPanel servers={servers} speakers={speakers} />
        )}
        {tab === "speakers" && (
          <>
            <ListToolbar
              noun="speakers"
              page={safePage}
              pageSize={PAGE_SIZE}
              total={matches.length}
              onPageChange={setPage}
            >
              <Button onClick={() => setDialog("new")}>
                <PlusIcon />
                Add speaker
              </Button>
            </ListToolbar>
            {matches.length === 0 ? (
              <EmptyState
                icon={<Volume2Icon />}
                title={
                  speakers.length === 0 ? "No speakers" : "No speakers found"
                }
                description={
                  speakers.length === 0
                    ? "Add the first one."
                    : "No speakers match the filters."
                }
              />
            ) : (
              <div className="flex flex-col overflow-hidden rounded border lg:min-h-0 lg:flex-1">
                <SpeakerTable
                  speakers={visible}
                  servers={servers}
                  testingId={test.isPending ? "pending" : null}
                  onSelect={setDialog}
                  onTest={runTest}
                  onDelete={setPendingDelete}
                />
              </div>
            )}
          </>
        )}
        <SpeakerDialog
          target={dialog}
          servers={servers}
          isPending={save.isPending}
          error={saveError}
          onClose={() => {
            setDialog(null);
            save.reset();
          }}
          onSave={async (draft, original) => {
            try {
              await save.mutateAsync({ draft, original });
              setDialog(null);
            } catch {
              return;
            }
          }}
        />
        <ConfirmDialog
          icon={Trash2Icon}
          variant="destructive"
          isOpen={pendingDelete !== null}
          title="Delete this speaker?"
          description="The speaker is removed from its edge server. A speaker used by a camera rule cannot be deleted."
          confirmLabel="Delete speaker"
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            if (pendingDelete) remove.mutate(pendingDelete);
            setPendingDelete(null);
          }}
        />
      </div>
    </PageShell>
  );
};
