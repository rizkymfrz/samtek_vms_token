import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserMenu } from "@/features/auth/components/user-menu";
import { QueryProvider } from "@/providers/query-provider";

const AppLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar footer={<UserMenu />} />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  );
};

export default AppLayout;
