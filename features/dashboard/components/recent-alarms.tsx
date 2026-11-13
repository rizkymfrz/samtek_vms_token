"use client";
import { useState } from "react";
import { AlertDetailDialog, AlertsTable } from "@/features/alerts";
import { NoData } from "./no-data";
import { useLiveAlarms } from "../hooks/use-live-alarms";
import type { Dashboard } from "../services/build-dashboard";

export const RecentAlarms = ({
  alarms: initial,
  deviceNames,
  relays,
}: {
  alarms: Dashboard["recentAlarms"];
  deviceNames: Dashboard["deviceNames"];
  relays: Dashboard["relays"];
}) => {
  const alarms = useLiveAlarms(initial, deviceNames, relays);
  const [openId, setOpenId] = useState<string | null>(null);
  if (!alarms.length) return <NoData>No alarms.</NoData>;
  return (
    <>
      <div className="overflow-hidden rounded border">
        <AlertsTable alerts={alarms} onSelect={setOpenId} />
      </div>
      <AlertDetailDialog
        alert={alarms.find((row) => row.id === openId) ?? null}
        onClose={() => setOpenId(null)}
      />
    </>
  );
};
