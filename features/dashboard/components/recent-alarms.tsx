import { RiskBadge } from "@/components/shared/risk-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dashboard } from "../services/build-dashboard";

export const RecentAlarms = ({
  alarms,
}: {
  alarms: Dashboard["recentAlarms"];
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Alarm</TableHead>
          <TableHead>Camera</TableHead>
          <TableHead>Object</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alarms.map((alarm) => (
          <TableRow key={alarm.id}>
            <TableCell className="tabular-nums">{alarm.time}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{alarm.title}</span>
                <span className="text-muted-foreground">{alarm.detail}</span>
              </div>
            </TableCell>
            <TableCell>{alarm.device}</TableCell>
            <TableCell>{alarm.object}</TableCell>
            <TableCell>
              <RiskBadge level={alarm.risk} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {alarm.score.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
