import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlarmChart } from "./alarm-chart";
import { CornerBrackets } from "./corner-brackets";
import type { AnalyticGroup } from "../lib/analytic-groups";
import type { AnalyticStats } from "../lib/analytics-overview";

export const AnalyticCard = ({
  group,
  stats,
}: {
  group: AnalyticGroup;
  stats: AnalyticStats;
}) => {
  const Icon = group.icon;
  const isUsed = stats.cameras > 0;
  return (
    <Card className="relative gap-0 bg-popover py-0 text-popover-foreground">
      <CornerBrackets />
      <div className="flex items-center gap-4 p-4">
        <Icon
          strokeWidth={1.5}
          className={cn(
            "size-16 shrink-0",
            isUsed ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <CardTitle className="line-clamp-2">{group.title}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[2lh]">
            {group.description}
          </CardDescription>
        </div>
      </div>
      <AlarmChart stats={stats} />
      <CardFooter className="gap-2 *:flex-1">
        <Button
          nativeButton={false}
          render={<Link href={`/analytics/${group.slug}`} />}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};
