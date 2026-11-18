"use client";
import {
  BoxIcon,
  CctvIcon,
  ClockIcon,
  ScanSearchIcon,
  SquareDashedIcon,
} from "lucide-react";
import { useState } from "react";
import { MetaLine } from "@/components/shared/meta-line";
import { RiskBadge } from "@/components/shared/risk-badge";
import {
  ToastClose,
  ToastContent,
  Toaster,
  ToastTitle,
} from "@/components/ui/toast";
import { AlertDetailDialog } from "./alert-detail-dialog";
import { AlertImage } from "./alert-image";
import { alarmToast } from "../lib/alarm-toast";
import type { AlertRow } from "../types";

const NO_PERIMETER = "None";

const AlarmToastContent = ({
  row,
  onOpen,
}: {
  row: AlertRow;
  onOpen: () => void;
}) => (
  <ToastContent className="p-0">
    <button
      type="button"
      className="flex w-full items-center gap-2 p-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
      onClick={onOpen}
    >
      <div className="w-24 shrink-0">
        <AlertImage path={row.imagePath} src={row.imageUrl} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1 pr-8">
          <ToastTitle className="text-xs" />
          <RiskBadge level={row.risk} />
        </div>
        <MetaLine icon={ClockIcon} text={`${row.date} ${row.time}`} />
        <MetaLine icon={CctvIcon} text={row.camera} />
        <MetaLine icon={ScanSearchIcon} text={row.analytic} />
        <MetaLine icon={BoxIcon} text={row.object} />
        {row.perimeter !== NO_PERIMETER && (
          <MetaLine icon={SquareDashedIcon} text={row.perimeter} />
        )}
      </div>
    </button>
    <ToastClose className="absolute top-2 right-2" />
  </ToastContent>
);

export const AlarmToaster = () => {
  const [selected, setSelected] = useState<AlertRow | null>(null);
  return (
    <>
      <Toaster
        side="top"
        toastManager={alarmToast}
        renderToast={(toast) => (
          <AlarmToastContent
            row={(toast.data as { row: AlertRow }).row}
            onOpen={() => {
              setSelected((toast.data as { row: AlertRow }).row);
              alarmToast.close(toast.id);
            }}
          />
        )}
      />
      <AlertDetailDialog alert={selected} onClose={() => setSelected(null)} />
    </>
  );
};
