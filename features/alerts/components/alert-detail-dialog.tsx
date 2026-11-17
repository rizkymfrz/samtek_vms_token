import {
  BoxIcon,
  CctvIcon,
  ClockIcon,
  DownloadIcon,
  HashIcon,
  ScanSearchIcon,
  ShieldAlertIcon,
  SquareDashedIcon,
} from "lucide-react";
import {
  DetailField,
  DetailIdBox,
  DetailLabel,
  DetailRow,
} from "@/components/shared/detail-fields";
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
                  <DetailLabel>Summary</DetailLabel>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <DetailField
                      icon={CctvIcon}
                      label="Camera"
                      value={alert.camera}
                    />
                    <DetailField
                      icon={ClockIcon}
                      label="Time"
                      value={`${alert.date} ${alert.time}`}
                    />
                    <DetailField
                      icon={ScanSearchIcon}
                      label="Analytic"
                      value={alert.analytic}
                    />
                    <DetailField
                      icon={BoxIcon}
                      label="Object"
                      value={alert.object}
                    />
                    <DetailField
                      icon={SquareDashedIcon}
                      label="Perimeter"
                      value={alert.perimeter}
                    />
                    <DetailField
                      icon={HashIcon}
                      label="Track ID"
                      value={
                        alert.trackId === 0 ? "None" : String(alert.trackId)
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <DetailLabel>Confidence</DetailLabel>
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
                    <DetailLabel>Details</DetailLabel>
                    {alert.details.map((detail) => (
                      <DetailRow
                        key={detail.label}
                        label={detail.label}
                        value={detail.value}
                      />
                    ))}
                  </div>
                )}
                <DetailIdBox
                  label="Event ID"
                  value={alert.id}
                  copyLabel="Copy event ID"
                />
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
