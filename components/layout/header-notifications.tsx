"use client";
import {
  BellIcon,
  BoxIcon,
  CctvIcon,
  ScanSearchIcon,
  SquareDashedIcon,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { MetaLine } from "@/components/shared/meta-line";
import { RiskBadge } from "@/components/shared/risk-badge";
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
import type { RiskLevel } from "@/types/risk";

const MAX_BADGE = 99;

export type HeaderAlert = {
  id: string;
  title: string;
  source: string;
  analytic: string;
  object: string;
  perimeter: string | null;
  risk: RiskLevel;
  time: string;
  severity: "critical" | "info";
  read: boolean;
  image: ReactNode;
};

export const HeaderNotifications = ({
  alerts,
  unread,
  onMarkAllRead,
  onSelect,
}: {
  alerts: HeaderAlert[];
  unread: number;
  onMarkAllRead: () => void;
  onSelect: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
      <PopoverContent align="end" className="w-96 gap-0 p-0">
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
            <li key={alert.id} className="border-b last:border-b-0">
              <button
                type="button"
                className="flex w-full items-center gap-2 p-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                onClick={() => {
                  setIsOpen(false);
                  onSelect(alert.id);
                }}
              >
                <StatusDot
                  status={
                    alert.read
                      ? "none"
                      : alert.severity === "critical"
                        ? "danger"
                        : "info"
                  }
                />
                <div className="w-24 shrink-0">{alert.image}</div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1">
                      <span className={cn(!alert.read && "font-medium")}>
                        {alert.title}
                      </span>
                      <RiskBadge level={alert.risk} />
                    </div>
                    <span className="shrink-0 text-muted-foreground">
                      {alert.time}
                    </span>
                  </div>
                  <MetaLine icon={CctvIcon} text={alert.source} />
                  <MetaLine icon={ScanSearchIcon} text={alert.analytic} />
                  <MetaLine icon={BoxIcon} text={alert.object} />
                  {alert.perimeter && (
                    <MetaLine icon={SquareDashedIcon} text={alert.perimeter} />
                  )}
                </div>
              </button>
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
