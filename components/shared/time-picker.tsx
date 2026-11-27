import { Pick, type PickItem } from "@/components/shared/pick";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

const range = (count: number): PickItem[] =>
  Array.from({ length: count }, (_, index) => ({
    value: pad(index),
    label: pad(index),
  }));

const HOURS = range(24);
const SIXTIES = range(60);

const parts = (value: string) => {
  const [hour = "00", minute = "00", second = "00"] = value.split(":");
  return [hour, minute, second].map((part) => pad(Number(part) || 0));
};

export const TimePicker = ({
  label,
  value,
  onChange,
  hasSeconds = true,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hasSeconds?: boolean;
  className?: string;
}) => {
  const [hour, minute, second] = parts(value);
  const field = "min-w-0 flex-1";
  const join = (h: string, m: string, sec: string) =>
    hasSeconds ? `${h}:${m}:${sec}` : `${h}:${m}`;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Pick
        label={`${label} hour`}
        items={HOURS}
        value={hour}
        onChange={(next) => onChange(join(next, minute, second))}
        className={field}
      />
      <span className="text-xs text-muted-foreground">:</span>
      <Pick
        label={`${label} minute`}
        items={SIXTIES}
        value={minute}
        onChange={(next) => onChange(join(hour, next, second))}
        className={field}
      />
      {hasSeconds && (
        <>
          <span className="text-xs text-muted-foreground">:</span>
          <Pick
            label={`${label} second`}
            items={SIXTIES}
            value={second}
            onChange={(next) => onChange(join(hour, minute, next))}
            className={field}
          />
        </>
      )}
    </div>
  );
};
