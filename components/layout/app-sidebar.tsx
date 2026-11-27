"use client";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NAV_GROUPS } from "@/config/navigation";
import { BrandLogo } from "./brand-logo";
import { useNavChildren } from "./use-nav-children";

export const AppSidebar = ({ footer }: { footer: ReactNode }) => {
  const pathname = usePathname();
  const selectedId = useSearchParams().get("id");
  const children = useNavChildren();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-(--header-height) justify-center border-b py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-10"
              render={<Link href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center">
                <BrandLogo className="size-6" />
              </div>
              <span className="font-semibold tracking-wide">SAMTEK</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(
                  ({ href, title, icon: Icon, children: key }) => {
                    const isActive =
                      pathname === href || pathname.startsWith(`${href}/`);
                    const subs = key ? children[key] : [];
                    if (subs.length === 0) {
                      return (
                        <SidebarMenuItem key={href}>
                          <SidebarMenuButton
                            tooltip={title}
                            className="data-active:bg-transparent data-active:hover:bg-sidebar-accent"
                            isActive={isActive}
                            render={<Link href={href} />}
                          >
                            <Icon />
                            <span>{title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
                    return (
                      <Collapsible
                        key={href}
                        open={expanded[href] ?? true}
                        onOpenChange={(open) =>
                          setExpanded((current) => ({
                            ...current,
                            [href]: open,
                          }))
                        }
                        render={<SidebarMenuItem />}
                        className="group/collapsible"
                      >
                        <SidebarMenuButton
                          tooltip={title}
                          className="data-active:bg-transparent data-active:hover:bg-sidebar-accent"
                          isActive={isActive}
                          render={<Link href={href} />}
                        >
                          <Icon />
                          <span>{title}</span>
                        </SidebarMenuButton>
                        <CollapsibleTrigger
                          aria-label={`Toggle ${title}`}
                          className="absolute top-1.5 right-1 flex size-5 items-center justify-center rounded text-sidebar-foreground outline-hidden hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
                        >
                          <ChevronRightIcon className="size-4 transition-transform group-data-[panel-open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="max-h-64 overflow-y-auto">
                            {subs.map((sub) => {
                              const isSubActive =
                                key === "cameras"
                                  ? pathname === sub.href ||
                                    pathname.startsWith(`${sub.href}/`)
                                  : isActive && selectedId === sub.id;
                              return (
                                <SidebarMenuSubItem key={sub.id}>
                                  <SidebarMenuSubButton
                                    className="relative before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-sidebar-primary before:opacity-0 data-active:bg-transparent data-active:font-medium data-active:before:opacity-100 data-active:hover:bg-sidebar-accent [&>svg]:size-4 data-active:[&>svg]:text-sidebar-primary"
                                    isActive={isSubActive}
                                    aria-current={
                                      isSubActive ? "page" : undefined
                                    }
                                    render={<Link href={sub.href} />}
                                  >
                                    <Icon />
                                    <span>{sub.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  },
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t">{footer}</SidebarFooter>
    </Sidebar>
  );
};
