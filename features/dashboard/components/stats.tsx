export const Stats = ({
  items,
}: {
  items: [value: number, label: string][];
}) => {
  return (
    <div className="flex gap-8">
      {items.map(([value, label]) => (
        <div key={label} className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
};
