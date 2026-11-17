import { FingerprintIcon, type LucideIcon } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

export const DetailLabel = ({ children }: { children: string }) => {
  return <span className="text-sm font-medium">{children}</span>;
};

export const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2 text-xs last:border-b-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-words">{value}</span>
    </div>
  );
};

export const DetailField = ({
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

export const DetailIdBox = ({
  label,
  value,
  copyLabel,
}: {
  label: string;
  value: string;
  copyLabel: string;
}) => {
  return (
    <div className="flex flex-col rounded bg-muted px-4 py-1">
      <div className="flex items-center justify-between gap-4 py-1 text-[11px]">
        <span className="flex items-center gap-1 text-muted-foreground">
          <FingerprintIcon className="size-3 shrink-0" />
          {label}
        </span>
        <span className="flex items-center gap-1">
          {value}
          <CopyButton value={value} label={copyLabel} />
        </span>
      </div>
    </div>
  );
};
