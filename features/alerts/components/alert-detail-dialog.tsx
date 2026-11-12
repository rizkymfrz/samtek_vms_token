import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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

export const AlertDetailDialog = ({
  alert,
  onClose,
}: {
  alert: AlertRow | null;
  onClose: () => void;
}) => {
  const [clipId, setClipId] = useState<string | null>(null);
  const close = () => {
    setClipId(null);
    onClose();
  };
  return (
    <Dialog open={alert !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="md:max-w-2xl">
        {alert && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{alert.title}</DialogTitle>
                <RiskBadge level={alert.risk} />
              </div>
              <DialogDescription>{alert.description}</DialogDescription>
            </DialogHeader>
            <Separator />
            <DialogBody>
              <DialogSection>
                <div className="flex flex-col gap-2">
                  {alert.clip && clipId === alert.id ? (
                    <AlertClipPlayer clip={alert.clip} />
                  ) : (
                    <AlertImage
                      path={alert.imagePath}
                      src={alert.imageUrl}
                      className="w-full"
                    />
                  )}
                  <span className="text-xs break-all text-muted-foreground">
                    {alert.imagePath}
                  </span>
                  {alert.clip && clipId !== alert.id && (
                    <Button
                      variant="secondary"
                      onClick={() => setClipId(alert.id)}
                    >
                      <PlayIcon />
                      Play clip
                    </Button>
                  )}
                </div>
              </DialogSection>
              <DialogDivider />
              <DialogSection>
                <div className="flex flex-col">
                  <Row label="Time" value={`${alert.date} ${alert.time}`} />
                  <Row label="Camera" value={alert.camera} />
                  <Row label="Analytic" value={alert.analytic} />
                  <Row label="Object" value={alert.object} />
                  <Row label="Score" value={alert.score.toFixed(2)} />
                  <Row label="Perimeter" value={alert.perimeter} />
                  <Row
                    label="Track ID"
                    value={alert.trackId === 0 ? "None" : String(alert.trackId)}
                  />
                  <Row label="Frame" value={alert.frame} />
                  <Row label="Event ID" value={alert.id} />
                </div>
                {alert.details.length > 0 && (
                  <div className="flex flex-col">
                    <span className="pb-2 text-sm font-medium">Details</span>
                    {alert.details.map((detail) => (
                      <Row
                        key={detail.label}
                        label={detail.label}
                        value={detail.value}
                      />
                    ))}
                  </div>
                )}
              </DialogSection>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
