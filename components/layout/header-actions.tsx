"use client";
import { PlusIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const PAGE_ACTIONS: Record<string, string> = {
  "/users": "Add User",
};

export const HeaderActions = () => {
  const pathname = usePathname();
  const label = PAGE_ACTIONS[`/${pathname.split("/")[1]}`];
  if (!label) return null;
  return (
    <Button>
      <PlusIcon />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
};
