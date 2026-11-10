export const Stats = ({
  items,
}: {
  items: [label: string, value: string][];
}) => {
  return (
    <div className="flex justify-between gap-4">
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1">
          <span>{label}</span>
          <span className="text-sm font-medium text-foreground tabular-nums">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};
