"use client";
import {
  CctvIcon,
  ClockIcon,
  DownloadIcon,
  FingerprintIcon,
  HashIcon,
  type LucideIcon,
  ScanFaceIcon,
  ScanSearchIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { Thumbnail } from "@/components/shared/thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress, ProgressValue } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "../lib/format-recognition";
import { matchPercent } from "../lib/match-score";
import type { RecognitionRow } from "../types";

const Field = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Icon className="size-3 shrink-0" />
        {label}
      </span>
      <span className="text-xs font-medium break-words">{value}</span>
    </div>
  );
};

const Label = ({ children }: { children: string }) => {
  return <span className="text-sm font-medium">{children}</span>;
};

export const RecognitionDialog = ({
  recognition,
  onClose,
}: {
  recognition: RecognitionRow | null;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={recognition !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent size="xl">
        {recognition && (
          <>
            <DialogHeader icon={ScanFaceIcon}>
              <div className="flex items-center gap-2">
                <DialogTitle>{recognition.name}</DialogTitle>
                <Badge>{recognition.group}</Badge>
              </div>
              <DialogDescription>
                Recognized by {recognition.camera}.
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <DialogBody>
              <DialogSection className="md:flex-[1.35]">
                <Tabs key={recognition.id} defaultValue="capture">
                  <TabsList variant="line" size="sm">
                    <TabsTrigger value="capture">Live Capture</TabsTrigger>
                    <TabsTrigger
                      value="reference"
                      disabled={!recognition.referenceUrl}
                    >
                      Reference Image
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="capture">
                    <Thumbnail
                      src={recognition.cropUrl}
                      label={`Detected face of ${recognition.name}`}
                      icon={ScanFaceIcon}
                      className="aspect-video w-full"
                      imageClassName="object-contain"
                      iconClassName="size-8"
                    />
                  </TabsContent>
                  <TabsContent value="reference">
                    <Thumbnail
                      src={recognition.referenceUrl}
                      label={`Registered photo of ${recognition.name}`}
                      icon={UserIcon}
                      className="aspect-video w-full"
                      imageClassName="object-contain"
                      iconClassName="size-8"
                    />
                  </TabsContent>
                </Tabs>
              </DialogSection>
              <DialogDivider />
              <DialogSection>
                <div className="flex flex-col gap-2">
                  <Label>Summary</Label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <Field
                      icon={UserIcon}
                      label="Person"
                      value={recognition.name}
                    />
                    <Field
                      icon={TagIcon}
                      label="Group"
                      value={recognition.group}
                    />
                    <Field
                      icon={CctvIcon}
                      label="Camera"
                      value={recognition.camera}
                    />
                    <Field
                      icon={ClockIcon}
                      label="Time"
                      value={formatDateTime(new Date(recognition.at))}
                    />
                    <Field
                      icon={HashIcon}
                      label="Person ID"
                      value={recognition.personId ?? "—"}
                    />
                    <Field
                      icon={ScanSearchIcon}
                      label="Detection"
                      value={`${Math.round(recognition.confidence * 100)}%`}
                    />
                  </div>
                </div>
                {recognition.similarity !== null && (
                  <div className="flex flex-col gap-2">
                    <Label>Match</Label>
                    <Progress
                      value={matchPercent(recognition.similarity)}
                      variant="segmented"
                      aria-label="Match"
                      className="flex-nowrap items-center gap-4"
                    >
                      <ProgressValue className="ml-0 text-lg text-foreground">
                        {(_, value) => `${value}%`}
                      </ProgressValue>
                    </Progress>
                  </div>
                )}
                <div className="flex flex-col rounded bg-muted px-4 py-1">
                  <div className="flex items-center justify-between gap-4 py-1 text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FingerprintIcon className="size-3 shrink-0" />
                      Event ID
                    </span>
                    <span className="flex items-center gap-1">
                      {recognition.id}
                      <CopyButton
                        value={recognition.id}
                        label="Copy event ID"
                      />
                    </span>
                  </div>
                </div>
              </DialogSection>
            </DialogBody>
            <Separator />
            <DialogFooter>
              <Button
                disabled={!recognition.cropUrl}
                nativeButton={false}
                render={
                  <a
                    href={recognition.cropUrl ?? undefined}
                    download={`${recognition.id.replace(":", "_")}.jpg`}
                  />
                }
              >
                <DownloadIcon />
                Download capture
              </Button>
              <Button
                variant="secondary"
                disabled={!recognition.referenceUrl}
                nativeButton={false}
                render={
                  <a
                    href={recognition.referenceUrl ?? undefined}
                    download={`${recognition.personId ?? "reference"}.jpg`}
                  />
                }
              >
                <DownloadIcon />
                Download reference
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
