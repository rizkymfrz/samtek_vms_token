"use client";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MAX_BADGE = 99;

export type HeaderAlert = {
  id: string;
  title: string;
  source: string;
  time: string;
  severity: "critical" | "info";
  read: boolean;
};

export const HeaderNotifications = ({
  alerts,
  unread,
  onMarkAllRead,
}: {
  alerts: HeaderAlert[];
  unread: number;
  onMarkAllRead: () => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative"
          />
        }
      >
        <BellIcon />
        {unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-0.5 right-0.5 h-4 min-w-4 px-0.5 tabular-nums"
          >
            {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <PopoverHeader className="flex-row items-center justify-between border-b p-2">
          <PopoverTitle>Alerts</PopoverTitle>
          <Button
            variant="ghost"
            disabled={unread === 0}
            onClick={onMarkAllRead}
          >
            Mark all as read
          </Button>
        </PopoverHeader>
        {alerts.length === 0 && (
          <p className="p-4 text-center text-muted-foreground">No alerts.</p>
        )}
        <ul className="max-h-80 overflow-auto">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start gap-2 border-b p-2 last:border-b-0"
            >
              <StatusDot
                className="mt-1"
                status={
                  alert.read
                    ? "none"
                    : alert.severity === "critical"
                      ? "danger"
                      : "info"
                }
              />
              <div className="grid flex-1">
                <span className={cn(!alert.read && "font-medium")}>
                  {alert.title}
                </span>
                <span className="text-muted-foreground">{alert.source}</span>
              </div>
              <span className="text-muted-foreground">{alert.time}</span>
            </li>
          ))}
        </ul>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full"
            nativeButton={false}
            render={<Link href="/alerts" />}
          >
            View all alerts
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
