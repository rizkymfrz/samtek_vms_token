import { AnalyticsTabs } from "@/features/analytics/components/analytics-tabs";

const Layout = ({ children }: LayoutProps<"/analytics">) => {
  return (
    <div className="flex min-h-full flex-col lg:h-[calc(100svh-var(--header-height))] lg:min-h-0">
      <AnalyticsTabs />
      {children}
    </div>
  );
};

export default Layout;
