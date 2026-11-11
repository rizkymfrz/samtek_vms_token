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
        <div className="flex h-2 gap-0.5 overflow-hidden rounded">
          <span className="bg-chart-2" style={{ width: `${share}%` }} />
          <span className="flex-1 bg-muted" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>New</span>
          <span>Returning</span>
        </div>
      </div>
    </div>
  );
};
