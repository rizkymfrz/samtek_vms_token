import { SearchIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const SidePanel = ({ children }: { children: ReactNode }) => {
  return (
    <aside className="w-full shrink-0 border-t max-lg:order-last lg:h-full lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-r">
      <div className="flex min-h-full flex-col gap-4 p-4">{children}</div>
    </aside>
  );
};

export const PanelSection = ({
  title,
  action,
  shouldGrow,
  children,
}: {
  title: string;
  action?: ReactNode;
  shouldGrow?: boolean;
  children: ReactNode;
}) => {
  return (
    <section className={cn("flex flex-col gap-4", shouldGrow && "flex-1")}>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        {action}
      </div>
      {children}
    </section>
  );
};

export const PanelReset = ({
  isDisabled,
  onClick,
}: {
  isDisabled: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="flex">
      <Button
        variant="secondary"
        className="flex-1"
        disabled={isDisabled}
        onClick={onClick}
      >
        Reset
      </Button>
    </div>
  );
};

export const PanelField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
};

export const PanelSearch = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder.replace(/\.+$/, "")}
        className="pl-8"
      />
    </div>
  );
};

export const PanelOption = ({
  isSelected,
  onClick,
  children,
}: {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 p-2 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent",
        isSelected && "bg-accent font-medium",
      )}
    >
      {children}
    </button>
  );
};

export const PanelEmpty = ({ children }: { children: ReactNode }) => {
  return (
    <p className="py-4 text-center text-xs text-muted-foreground">{children}</p>
  );
};
