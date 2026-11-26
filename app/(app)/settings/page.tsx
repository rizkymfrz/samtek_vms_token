import type { Metadata } from "next";
import { EndpointsSettings } from "@/features/settings/components/endpoints-settings";

export const metadata: Metadata = { title: "Settings" };

const Page = () => {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Set the central API and MQTT addresses this browser connects to.
        </p>
      </div>
      <EndpointsSettings />
    </div>
  );
};

export default Page;
