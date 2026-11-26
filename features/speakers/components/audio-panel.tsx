"use client";
import {
  FileAudioIcon,
  HardDriveIcon,
  ServerIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { AudioDialog } from "./audio-dialog";
import {
  useSpeakerAudio,
  useSpeakerAudioActions,
} from "../hooks/use-speaker-audio";
import { formatBytes } from "../lib/audio-files";
import type { ServerOption, SpeakerAudio } from "../types";

const ALL = "all";

export const AudioPanel = ({ servers }: { servers: ServerOption[] }) => {
  const { data, isPending, isError } = useSpeakerAudio();
  const { upload, remove, uploadError, removeError } = useSpeakerAudioActions();
  const [server, setServer] = useState(ALL);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SpeakerAudio | null>(null);
  useFailureToast("Failed to delete the audio file", [removeError]);
  useFailureToast(
    "Some data did not load",
    (data?.failures ?? []).map((item) => `${item.edgeName}: ${item.message}`),
  );
  const visible = useMemo(
    () =>
      (data?.audios ?? []).filter(
        (audio) => server === ALL || audio.edgeId === server,
      ),
    [data, server],
  );
  const serverItems = [
    { value: ALL, label: "All edge servers" },
    ...servers.map((item) => ({ value: item.id, label: item.name })),
  ];
  return (
    <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Pick
          label="Edge server"
          icon={ServerIcon}
          items={serverItems}
          value={server}
          onChange={setServer}
          className="w-56"
        />
        <Button onClick={() => setIsUploading(true)}>
          <UploadIcon />
          Upload audio
        </Button>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={<FileAudioIcon />}
          title={
            isPending
              ? "Loading audio files…"
              : isError
                ? "Failed to load the audio files"
                : "No audio files"
          }
          description={
            isPending || isError
              ? undefined
              : "Upload the first one to play it from a camera rule."
          }
        />
      ) : (
        <div className="flex flex-col overflow-hidden rounded border lg:min-h-0 lg:flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead icon={FileAudioIcon}>Name</TableHead>
                <TableHead icon={ServerIcon}>Edge server</TableHead>
                <TableHead icon={FileAudioIcon}>Format</TableHead>
                <TableHead icon={HardDriveIcon}>Size</TableHead>
                <TableHead icon={Trash2Icon} className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((audio) => (
                <TableRow key={`${audio.edgeId}-${audio.id}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{audio.name}</span>
                      <span className="text-muted-foreground">
                        ID {audio.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{audio.edgeName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {audio.format.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatBytes(audio.bytes)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Button
                        variant="destructive"
                        size="icon"
                        aria-label={`Delete ${audio.name}`}
                        title={`Delete ${audio.name}`}
                        onClick={() => setPendingDelete(audio)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <AudioDialog
        isOpen={isUploading}
        servers={servers}
        defaultServerId={server === ALL ? (servers[0]?.id ?? "") : server}
        isPending={upload.isPending}
        error={uploadError}
        onClose={() => {
          setIsUploading(false);
          upload.reset();
        }}
        onSave={async (edgeId, file, name) => {
          try {
            await upload.mutateAsync({ edgeId, file, name });
            setIsUploading(false);
          } catch {
            return;
          }
        }}
      />
      <ConfirmDialog
        icon={Trash2Icon}
        variant="destructive"
        isOpen={pendingDelete !== null}
        title="Delete this audio file?"
        description="A camera rule that plays this file will fail until you choose another one."
        confirmLabel="Delete audio"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            remove.mutate({
              edgeId: pendingDelete.edgeId,
              audioId: pendingDelete.id,
            });
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
};
