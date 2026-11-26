import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export const ListToolbar = ({
  noun,
  page,
  pageSize,
  total,
  onPageChange,
  children,
}: {
  noun: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  children?: ReactNode;
}) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">{children}</div>
      <div className="flex items-center gap-2">
        <span className="mr-2 text-xs text-muted-foreground tabular-nums">
          {total === 0
            ? `0 ${noun}`
            : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total}`}
        </span>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Next page"
          disabled={page >= pages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
};
