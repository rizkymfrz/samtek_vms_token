import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

const AppLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
