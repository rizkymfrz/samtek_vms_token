import type { ReactNode } from "react";

export const SidePanel = ({ children }: { children: ReactNode }) => {
  return (
    <aside className="w-full shrink-0 border-t max-lg:order-last lg:h-full lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-r">
      {children}
    </aside>
  );
};
