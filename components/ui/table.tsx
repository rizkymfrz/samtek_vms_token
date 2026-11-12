import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

const Table = ({ className, ...props }: ComponentProps<"table">) => {
  return (
    <div
      data-slot="table-container"
      className="relative min-h-0 w-full flex-1 scrollbar-thin overflow-auto rounded bg-card"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
};

const TableHeader = ({ className, ...props }: ComponentProps<"thead">) => {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "sticky top-0 z-10 bg-muted shadow-[0_1px_0_0_var(--border)] [&_tr]:border-b-0",
        className,
      )}
      {...props}
    />
  );
};

const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
};

const TableFooter = ({ className, ...props }: ComponentProps<"tfoot">) => {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
};

const TableRow = ({ className, ...props }: ComponentProps<"tr">) => {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors even:bg-muted/20 hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
};

const TableHead = ({
  className,
  icon: Icon,
  children,
  ...props
}: ComponentProps<"th"> & { icon: LucideIcon }) => {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle text-sm font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="size-4 shrink-0" />
        {children}
      </span>
    </th>
  );
};

const TableCell = ({ className, ...props }: ComponentProps<"td">) => {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
};

const TableCaption = ({ className, ...props }: ComponentProps<"caption">) => {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
