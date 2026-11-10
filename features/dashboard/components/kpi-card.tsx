import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "./sparkline";

export const KpiCard = ({
  label,
  value,
  icon: Icon,
  change,
  spark,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change: number;
  spark: number[];
}) => {
  const ChangeIcon = change < 0 ? ArrowDownRightIcon : ArrowUpRightIcon;
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs">{label}</span>
          <Icon className="size-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{value}</span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <ChangeIcon className="size-3.5" />
            <span className="tabular-nums">{Math.abs(change)}%</span>
          </span>
        </div>
        <div className="mt-auto">
          <Sparkline data={spark} />
        </div>
      </CardContent>
    </Card>
  );
};
