import {
  BatteryFullIcon,
  BatteryLowIcon,
  BatteryMediumIcon,
  BatteryWarningIcon,
  IdCardIcon,
  type LucideIcon,
  MapPinIcon,
  RadioIcon,
  SignalIcon,
  UserIcon,
} from "lucide-react";
import type { BodywornState } from "@/features/edge-status";

const batteryIcon = (percent: number) =>
  percent <= 10
    ? BatteryWarningIcon
    : percent <= 40
      ? BatteryLowIcon
      : percent <= 75
        ? BatteryMediumIcon
        : BatteryFullIcon;

const Row = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2">
    <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
    <dt className="sr-only">{label}</dt>
    <dd className="truncate font-medium" title={label}>
      {value}
    </dd>
  </div>
);

export const BodywornDetails = ({ state }: { state: BodywornState }) => {
  const { isOnline, network, policeNumber, name, batteryPercent, position } =
    state;
  return (
    <dl className="flex flex-col gap-1 border-t p-2 text-xs">
      {name !== null && <Row icon={UserIcon} label="Name" value={name} />}
      {policeNumber !== null && (
        <Row icon={IdCardIcon} label="Police No." value={policeNumber} />
      )}
      {isOnline !== null && (
        <Row
          icon={RadioIcon}
          label="Status"
          value={isOnline ? "Online" : "Offline"}
        />
      )}
      {network !== null && (
        <Row icon={SignalIcon} label="Network" value={network.toUpperCase()} />
      )}
      {batteryPercent !== null && (
        <Row
          icon={batteryIcon(batteryPercent)}
          label="Battery"
          value={`${batteryPercent}%`}
        />
      )}
      {position && (
        <Row
          icon={MapPinIcon}
          label="Position"
          value={`${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`}
        />
      )}
    </dl>
  );
};
