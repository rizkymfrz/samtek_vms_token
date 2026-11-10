import { Badge } from "@/components/ui/badge";
import { type Level, LEVEL_LABEL } from "../lib/metric-level";

export const LevelBadge = ({ level }: { level: Level }) => {
  return (
    <Badge
      variant={
        level === "normal"
          ? "outline"
          : level === "warning"
            ? "secondary"
            : "destructive"
      }
    >
      {LEVEL_LABEL[level]}
    </Badge>
  );
};
