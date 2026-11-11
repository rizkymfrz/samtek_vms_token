"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useBreadcrumbLabels } from "@/hooks/use-breadcrumb-labels";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { HeaderActions } from "./header-actions";
import { HeaderClock } from "./header-clock";
import { HeaderNotifications } from "./header-notifications";
import { HeaderSearch } from "./header-search";
import { ThemeSwitcher } from "./theme-switcher";

export const AppHeader = ({ status }: { status: ReactNode }) => {
  const pathname = usePathname();
  const labels = useBreadcrumbLabels();
  const crumbs = getBreadcrumbs(pathname, labels);
  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" />
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={crumb.label + index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : crumb.href ? (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-4">
        {status}
        <HeaderClock />
        <HeaderSearch />
        <HeaderNotifications />
        <ThemeSwitcher />
        <HeaderActions />
      </div>
    </header>
  );
};
