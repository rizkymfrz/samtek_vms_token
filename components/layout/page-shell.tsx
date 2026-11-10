import type { ReactNode } from "react";

export const PageShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-full flex-col lg:h-[calc(100svh-var(--header-height))] lg:min-h-0 lg:flex-row">
      {children}
    </div>
  );
};
