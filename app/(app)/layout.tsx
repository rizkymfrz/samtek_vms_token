import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { QueryProvider } from "@/providers/query-provider";

const AppLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  );
};

export default AppLayout;
