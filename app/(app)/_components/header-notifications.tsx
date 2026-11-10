"use client";
import * as React from "react";
import Link from "next/link";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ALERTS } from "./dummy-data";
import { StatusDot } from "@/components/shared/status-dot";

export const HeaderNotifications = () => {
  const [alerts, setAlerts] = React.useState(ALERTS);
  const unread = alerts.filter((alert) => !alert.read).length;
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
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center bg-destructive px-0.5 text-xs font-medium text-background tabular-nums">
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <PopoverHeader className="flex-row items-center justify-between border-b p-2">
          <PopoverTitle>Alerts</PopoverTitle>
          <Button
            variant="ghost"
            size="xs"
            disabled={unread === 0}
            onClick={() =>
              setAlerts((items) => items.map((i) => ({ ...i, read: true })))
            }
          >
            Mark all as read
          </Button>
        </PopoverHeader>
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
