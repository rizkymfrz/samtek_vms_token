import { Badge } from "@/components/ui/badge";

export type RiskLevel = "low" | "medium" | "high";

const VARIANTS = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

export const RiskBadge = ({ level }: { level: RiskLevel }) => {
  return (
    <Badge variant={VARIANTS[level]} className="capitalize">
      {level}
    </Badge>
  );
};
