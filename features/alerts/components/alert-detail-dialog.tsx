import {
  BoxIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  FingerprintIcon,
  HashIcon,
  type LucideIcon,
  ScanSearchIcon,
  ShieldAlertIcon,
  SquareDashedIcon,
  VideoIcon,
} from "lucide-react";
import { useState } from "react";
import { RiskBadge } from "@/components/shared/risk-badge";
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
import { AlertClipPlayer } from "./alert-clip-player";
import { AlertImage } from "./alert-image";
import type { AlertRow } from "../types";

const Row = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2 text-xs last:border-b-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-words">{value}</span>
    </div>
  );
};

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

const CopyId = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      aria-label="Copy event ID"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};

export const AlertDetailDialog = ({
  alert,
  onClose,
}: {
  alert: AlertRow | null;
  onClose: () => void;
}) => {
  return (
    <Dialog open={alert !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="xl">
        {alert && (
          <>
            <DialogHeader icon={ShieldAlertIcon}>
              <div className="flex items-center gap-2">
                <DialogTitle>{alert.title}</DialogTitle>
                <RiskBadge level={alert.risk} />
              </div>
              <DialogDescription>{alert.description}</DialogDescription>
            </DialogHeader>
            <Separator />
            <DialogBody>
              <DialogSection className="md:flex-[1.35]">
                <Tabs key={alert.id} defaultValue="image">
                  <TabsList variant="line" size="sm">
                    <TabsTrigger value="image">Image</TabsTrigger>
                    <TabsTrigger value="clip" disabled={!alert.clip}>
                      Clip
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="image">
                    <AlertImage
                      path={alert.imagePath}
                      src={alert.imageUrl}
                      className="w-full"
                    />
                  </TabsContent>
                  <TabsContent value="clip">
                    {alert.clip && <AlertClipPlayer clip={alert.clip} />}
                  </TabsContent>
                </Tabs>
              </DialogSection>
              <DialogDivider />
              <DialogSection>
                <div className="flex flex-col gap-2">
                  <Label>Summary</Label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <Field
                      icon={VideoIcon}
                      label="Camera"
                      value={alert.camera}
                    />
                    <Field
                      icon={ClockIcon}
                      label="Time"
                      value={`${alert.date} ${alert.time}`}
                    />
                    <Field
                      icon={ScanSearchIcon}
                      label="Analytic"
                      value={alert.analytic}
                    />
                    <Field icon={BoxIcon} label="Object" value={alert.object} />
                    <Field
                      icon={SquareDashedIcon}
                      label="Perimeter"
                      value={alert.perimeter}
                    />
                    <Field
                      icon={HashIcon}
                      label="Track ID"
                      value={
                        alert.trackId === 0 ? "None" : String(alert.trackId)
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Confidence</Label>
                  <Progress
                    value={Math.round(alert.score * 100)}
                    variant="segmented"
                    aria-label="Confidence"
                    className="flex-nowrap items-center gap-4"
                  >
                    <ProgressValue className="ml-0 text-lg text-foreground">
                      {(_, value) => `${value}%`}
                    </ProgressValue>
                  </Progress>
                </div>
                {alert.details.length > 0 && (
                  <div className="flex flex-col">
                    <Label>Details</Label>
                    {alert.details.map((detail) => (
                      <Row
                        key={detail.label}
                        label={detail.label}
                        value={detail.value}
                      />
                    ))}
                  </div>
                )}
                <div className="flex flex-col rounded bg-muted px-4 py-1">
                  <div className="flex items-center justify-between gap-4 py-1 text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FingerprintIcon className="size-3 shrink-0" />
                      Event ID
                    </span>
                    <span className="flex items-center gap-1">
                      {alert.id}
                      <CopyId value={alert.id} />
                    </span>
                  </div>
                </div>
              </DialogSection>
            </DialogBody>
            <Separator />
            <DialogFooter>
              <Button
                disabled={!alert.imageUrl}
                nativeButton={false}
                render={
                  <a
                    href={alert.imageUrl ?? undefined}
                    download={`${alert.id.replace(":", "_")}.jpg`}
                  />
                }
              >
                <DownloadIcon />
                Download image
              </Button>
              <Button
                variant="secondary"
                disabled={!alert.clip}
                nativeButton={false}
                render={
                  <a
                    href={
                      alert.clip
                        ? `/api/edge/${alert.clip.edgeId}/alarms/${alert.clip.eventId}/clip`
                        : undefined
                    }
                    download={`${alert.id.replace(":", "_")}.mp4`}
                  />
                }
              >
                <DownloadIcon />
                Download clip
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
