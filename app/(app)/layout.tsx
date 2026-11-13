import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { isLiveSource } from "@/config/env";
import { AlertNotifications } from "@/features/alerts/components/alert-notifications";
import { UserMenu } from "@/features/auth/components/user-menu";
import { DeviceStatus } from "@/features/cameras/components/device-status";
import { EdgeStatusConnector } from "@/features/edge-status";
import { GlobalSearch } from "@/features/search/components/global-search";
import { QueryProvider } from "@/providers/query-provider";

const AppLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <QueryProvider>
      <EdgeStatusConnector />
      <Toaster>
        <SidebarProvider>
          <Suspense fallback={null}>
            <AppSidebar footer={<UserMenu />} isLive={isLiveSource} />
          </Suspense>
          <SidebarInset className="isolate min-w-0">
            <PageBackdrop />
            <AppHeader
              status={<DeviceStatus />}
              search={<GlobalSearch />}
              notifications={<AlertNotifications />}
            />
            <main className="flex-1">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </Toaster>
    </QueryProvider>
  );
};

export default AppLayout;
