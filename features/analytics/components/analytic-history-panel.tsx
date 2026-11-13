"use client";
import { CalendarIcon, HistoryIcon, type LucideIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { DateRange } from "react-day-picker";
import { PanelEmpty } from "@/components/layout/side-panel";
import { DateRangeDialog } from "@/components/shared/date-range-dialog";
import { Button } from "@/components/ui/button";
import { CompactPager } from "./compact-pager";

const PAGE_SIZE = 10;

export const HistoryPanel = <T extends { id: string }>({
  title,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  items,
  range,
  onRangeChange,
  onSelect,
  renderItem,
}: {
  title: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  items: T[];
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onSelect?: (id: string) => void;
  renderItem: (item: T) => ReactNode;
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [requestedPage, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
  const page = Math.min(requestedPage, lastPage);
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const itemClassName = "flex w-full flex-col gap-2 p-2 text-left text-xs";
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium">
          <HistoryIcon className="size-4" aria-hidden />
          {title}
        </span>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Filter by date"
          title="Filter by date"
          onClick={() => setIsPickerOpen(true)}
        >
          <CalendarIcon />
        </Button>
      </div>
      <DateRangeDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        title={`${title} date range`}
        value={range}
        onChange={(next) => {
          onRangeChange(next);
          setPage(0);
        }}
      />
      {items.length === 0 ? (
        <PanelEmpty
          icon={<EmptyIcon />}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col border max-lg:max-h-svh">
          <ul key={page} className="min-h-0 flex-1 overflow-y-auto">
            {visible.map((item) => (
              <li key={item.id} className="border-b last:border-b-0">
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`${itemClassName} outline-none hover:bg-accent focus-visible:bg-accent`}
                  >
                    {renderItem(item)}
                  </button>
                ) : (
                  <div className={itemClassName}>{renderItem(item)}</div>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t p-2">
            <CompactPager
              page={page}
              pageSize={PAGE_SIZE}
              total={items.length}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};
