import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
}) => (
  <Card size="sm" className="h-full">
    <CardContent className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span className="truncate text-xs">{label}</span>
        <Icon className="size-4 shrink-0" />
      </div>
      <span className="truncate text-2xl font-semibold tabular-nums">
        {value}
      </span>
      <span className="truncate text-xs text-muted-foreground">{hint}</span>
    </CardContent>
  </Card>
);
