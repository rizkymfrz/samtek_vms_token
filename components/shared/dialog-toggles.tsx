import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

export const DialogToggles = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Separator />
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </>
  );
};
