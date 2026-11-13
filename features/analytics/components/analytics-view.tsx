"use client";
import { TriangleAlertIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Pager } from "@/components/shared/pager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnalyticCard } from "./analytic-card";
import { useLiveOverview } from "../hooks/use-live-overview";
import { ANALYTIC_GROUPS } from "../lib/analytic-groups";
import type { AnalyticsOverview } from "../lib/analytics-overview";
import { setOverviewPage } from "../lib/overview-page";

const ROWS = 3;
const COLUMNS = 4;
const PAGE_SIZE = ROWS * COLUMNS;
const PAGES = Math.ceil(ANALYTIC_GROUPS.length / PAGE_SIZE);

const parsePage = (value: string | null) => {
  const page = Number(value) - 1;
  return Number.isInteger(page) && page >= 0 && page < PAGES ? page : 0;
};

export const AnalyticsView = ({ initial }: { initial: AnalyticsOverview }) => {
  const overview = useLiveOverview(initial);
  const page = parsePage(useSearchParams().get("page"));
  useEffect(() => {
    setOverviewPage(page);
  }, [page]);
  const changePage = (next: number) => {
    window.history.replaceState(
      null,
      "",
      next === 0 ? "/analytics" : `/analytics?page=${next + 1}`,
    );
  };
  const visible = ANALYTIC_GROUPS.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
      {overview.failedEdges.length > 0 && (
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>Some edge servers could not be reached</AlertTitle>
          <AlertDescription>
            Alarm counts may be lower than actual. Unreachable:{" "}
            {overview.failedEdges.join(", ")}.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-4 lg:grid-rows-3">
        {visible.map((group) => (
          <AnalyticCard
            key={group.slug}
            group={group}
            stats={overview.stats[group.slug]}
          />
        ))}
      </div>
      <Pager
        page={page}
        pageSize={PAGE_SIZE}
        total={ANALYTIC_GROUPS.length}
        onPageChange={changePage}
      />
    </div>
  );
};
