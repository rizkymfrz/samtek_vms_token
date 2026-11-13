"use client";
import { useEffect, useState } from "react";
import { subscribeEdgeEvents } from "@/features/edge-status";
import {
  type AnalyticsOverview,
  applyAlarm,
  rollOverview,
} from "../lib/analytics-overview";

const ROLL_INTERVAL_MS = 60_000;

export const useLiveOverview = (initial: AnalyticsOverview) => {
  const [overview, setOverview] = useState(initial);
  useEffect(() => {
    const stopEvents = subscribeEdgeEvents((event) => {
      if (event.kind !== "alarm") return;
      setOverview((previous) =>
        applyAlarm(
          previous,
          {
            analyticId: event.data.analytic_id,
            at: Date.parse(event.data.occurred_at),
          },
          Date.now(),
        ),
      );
    });
    const timer = setInterval(() => {
      setOverview((previous) => rollOverview(previous, Date.now()));
    }, ROLL_INTERVAL_MS);
    return () => {
      stopEvents();
      clearInterval(timer);
    };
  }, []);
  return overview;
};
