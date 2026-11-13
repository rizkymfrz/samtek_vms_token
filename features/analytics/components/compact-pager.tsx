import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CompactPager = ({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-2"
    >
      <Button
        variant="secondary"
        size="icon"
        aria-label="Previous page"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon />
      </Button>
      <span className="text-xs tabular-nums">
        {`Page ${page + 1} of ${pageCount}`}
      </span>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Next page"
        disabled={page >= pageCount - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </nav>
  );
};
