import { RiskBadge } from "@/components/shared/risk-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

export const AlertSheet = ({
  alert,
  onClose,
}: {
  alert: AlertRow | null;
  onClose: () => void;
}) => {
  return (
    <Sheet open={alert !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {alert && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{alert.title}</SheetTitle>
                <RiskBadge level={alert.risk} />
              </div>
              <SheetDescription>{alert.description}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4 pt-0">
              <div className="flex flex-col gap-2">
                <AlertImage
                  path={alert.imagePath}
                  src={alert.imageUrl}
                  className="w-full"
                />
                <span className="text-xs break-all text-muted-foreground">
                  {alert.imagePath}
                </span>
              </div>
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
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
