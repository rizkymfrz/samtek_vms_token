"use client";
import { PlusIcon, Trash2Icon, Volume2Icon } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { type DialogTarget, SpeakerDialog } from "./speaker-dialog";
import { SpeakerTable } from "./speaker-table";
import { useSpeakerActions } from "../hooks/use-speaker-actions";
import { useSpeakers } from "../hooks/use-speakers";
import type { SpeakerRecord, SpeakersData } from "../types";

const PAGE_SIZE = 20;

export const SpeakersView = ({ data }: { data: SpeakersData }) => {
  const { data: current } = useSpeakers(data);
  const { speakers, servers, failures } = current;
  useFailureToast(
    "Some data did not load",
    failures.map((failure) => `${failure.source}: ${failure.message}`),
  );
  const [page, setPage] = useState(0);
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
  const pages = Math.max(1, Math.ceil(speakers.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = speakers.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
      <ListToolbar
        noun="speakers"
        page={safePage}
        pageSize={PAGE_SIZE}
        total={speakers.length}
        onPageChange={setPage}
      >
        <Button onClick={() => setDialog("new")}>
          <PlusIcon />
          Add speaker
        </Button>
      </ListToolbar>
      {speakers.length === 0 ? (
        <EmptyState
          icon={<Volume2Icon />}
          title="No speakers"
          description="Add the first one."
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
  );
};
