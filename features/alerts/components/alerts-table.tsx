import {
  BoxIcon,
  ClockIcon,
  GaugeIcon,
  ImageIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
  VideoIcon,
} from "lucide-react";
import { RiskBadge } from "@/components/shared/risk-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertImage } from "./alert-image";
import type { AlertRow } from "../types";

export const AlertsTable = ({
  alerts,
  onSelect,
}: {
  alerts: AlertRow[];
  onSelect: (id: string) => void;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead icon={ImageIcon}>Snapshot</TableHead>
          <TableHead icon={ClockIcon}>Time</TableHead>
          <TableHead icon={ShieldAlertIcon}>Alert</TableHead>
          <TableHead icon={VideoIcon}>Camera</TableHead>
          <TableHead icon={BoxIcon}>Object</TableHead>
          <TableHead icon={TriangleAlertIcon}>Risk</TableHead>
          <TableHead icon={GaugeIcon} className="text-right">
            Score
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((row) => (
          <TableRow
            key={row.id}
            tabIndex={0}
            onClick={() => onSelect(row.id)}
            onKeyDown={(event) => event.key === "Enter" && onSelect(row.id)}
            className="cursor-pointer outline-none focus-visible:bg-muted"
          >
            <TableCell>
              <AlertImage
                path={row.imagePath}
                src={row.imageUrl}
                className="w-20"
              />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="flex flex-col">
                <span className="tabular-nums">{row.time}</span>
                <span className="text-muted-foreground">{row.date}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-72">
              <div className="flex flex-col">
                <span className="font-medium">{row.title}</span>
                <span className="truncate text-muted-foreground">
                  {row.description}
                </span>
              </div>
            </TableCell>
            <TableCell>{row.camera}</TableCell>
            <TableCell>{row.object}</TableCell>
            <TableCell>
              <RiskBadge level={row.risk} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {Math.round(row.score * 100)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
