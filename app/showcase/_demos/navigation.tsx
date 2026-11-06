"use client"
import * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Stack } from "../_components/layout"
import {
  accordion,
  breadcrumb,
  breadcrumbCurrent,
  collapsible,
  menubar,
  navigationMenu,
  pagination,
  sidebar,
  tabs,
} from "../_data/content"

const tabsListVariants = ["default", "line"] as const

export function TabsDemo() {
  return (
    <div className="flex flex-col gap-8">
      {tabsListVariants.map((variant) => (
        <Tabs key={variant} defaultValue={tabs[0].value}>
          <TabsList variant={variant}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <p className="text-sm text-muted-foreground">{tab.body}</p>
            </TabsContent>
          ))}
        </Tabs>
      ))}
    </div>
  )
}

export function AccordionDemo() {
  return (
    <Accordion defaultValue={[accordion[0].value]} className="max-w-md">
      {accordion.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function CollapsibleDemo() {
  return (
    <Collapsible className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{collapsible.title}</span>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <ChevronsUpDownIcon />
        </CollapsibleTrigger>
      </div>
      <span className="border px-4 py-2 text-sm">{collapsible.items[0]}</span>
      <CollapsibleContent className="flex flex-col gap-2">
        {collapsible.items.slice(1).map((label) => (
          <span key={label} className="border px-4 py-2 text-sm">
            {label}
          </span>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumb.map((crumb) => (
          <React.Fragment key={crumb.id}>
            <BreadcrumbItem>
              <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{breadcrumbCurrent}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        {pagination.pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href="#" isActive={page === pagination.active}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigationMenu.map((section) => (
          <NavigationMenuItem key={section.id}>
            <NavigationMenuTrigger>{section.label}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex w-64 flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <NavigationMenuLink href="#">
                      <span className="text-sm font-medium">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function MenubarDemo() {
  return (
    <Menubar>
      {menubar.map((menu) => (
        <MenubarMenu key={menu.id}>
          <MenubarTrigger>{menu.label}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map((label) => (
              <MenubarItem key={label}>{label}</MenubarItem>
            ))}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  )
}

export function SidebarDemo() {
  return (
    <Stack className="max-w-xs">
      <SidebarProvider className="min-h-0">
        <Sidebar collapsible="none" className="border">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{sidebar.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebar.items.map((label, index) => (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton isActive={index === 0}>{label}</SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </Stack>
  )
}
