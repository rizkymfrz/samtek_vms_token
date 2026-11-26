import type { Metadata } from "next";
import { EndpointsSettings } from "@/features/settings/components/endpoints-settings";

export const metadata: Metadata = { title: "Settings" };

const Page = () => {
  return (
    <div className="flex min-w-0 flex-1 flex-col p-4">
      <EndpointsSettings />
    </div>
  );
};

export default Page;
