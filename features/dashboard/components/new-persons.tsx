import { Progress } from "@/components/ui/progress";

export const NewPersons = ({
  value,
  total,
}: {
  value: number;
  total: number;
}) => {
  const share = total === 0 ? 0 : (value / total) * 100;
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">
          of {total} people seen
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Progress
          value={share}
          variant="segmented"
          filledClassName="data-filled:bg-chart-2"
          aria-label="Share of new people"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>New</span>
          <span>Returning</span>
        </div>
      </div>
    </div>
  );
};
