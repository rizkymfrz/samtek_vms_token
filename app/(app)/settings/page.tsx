import { SettingsIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Settings" };

const Page = () => {
  return (
    <div className="flex min-w-0 flex-1 flex-col p-4">
      <EmptyState
        icon={<SettingsIcon />}
        title="Settings are not available"
        description="There is nothing to configure here yet."
      />
    </div>
  );
};

export default Page;
