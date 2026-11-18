"use client";
import {
  CarFrontIcon,
  CctvIcon,
  ClockIcon,
  DownloadIcon,
  FingerprintIcon,
  type LucideIcon,
  PaletteIcon,
  ScanLineIcon,
  ScanSearchIcon,
} from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { Thumbnail } from "@/components/shared/thumbnail";
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
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "../lib/format-recognition";
import type { RecognitionRow } from "../types";

const Field = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="flex min-w-0 flex-col gap-0.5">
    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <Icon className="size-3 shrink-0" />
      {label}
    </span>
    <span className="text-xs font-medium break-words">{value}</span>
  </div>
);

export const PlateDialog = ({
  recognition,
  onClose,
}: {
  recognition: RecognitionRow | null;
  onClose: () => void;
}) => (
  <Dialog
    open={recognition !== null}
    onOpenChange={(open) => !open && onClose()}
  >
    <DialogContent size="xl">
      {recognition && (
        <>
          <DialogHeader icon={ScanLineIcon}>
            <DialogTitle>{recognition.plate ?? "Unreadable plate"}</DialogTitle>
            <DialogDescription>Read by {recognition.camera}.</DialogDescription>
          </DialogHeader>
          <Separator />
          <DialogBody>
            <DialogSection className="md:flex-[1.35]">
              <Thumbnail
                src={recognition.cropUrl}
                label={`Detected vehicle ${recognition.plate ?? ""}`}
                icon={CarFrontIcon}
                className="aspect-video w-full"
                imageClassName="object-contain"
                iconClassName="size-8"
              />
            </DialogSection>
            <DialogDivider />
            <DialogSection>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field
                  icon={ScanLineIcon}
                  label="Plate"
                  value={recognition.plate ?? "—"}
                />
                <Field
                  icon={CarFrontIcon}
                  label="Vehicle"
                  value={recognition.vehicleType ?? "—"}
                />
                <Field
                  icon={PaletteIcon}
                  label="Color"
                  value={recognition.vehicleColor ?? "—"}
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
                  icon={ScanSearchIcon}
                  label="Detection"
                  value={`${Math.round(recognition.confidence * 100)}%`}
                />
              </div>
              <div className="flex flex-col rounded bg-muted px-4 py-1">
                <div className="flex items-center justify-between gap-4 py-1 text-[11px]">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <FingerprintIcon className="size-3 shrink-0" />
                    Event ID
                  </span>
                  <span className="flex items-center gap-1">
                    {recognition.id}
                    <CopyButton value={recognition.id} label="Copy event ID" />
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
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>
);
