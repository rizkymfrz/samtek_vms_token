import {
  BarChart3Icon,
  BellIcon,
  Building2Icon,
  CctvIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MapIcon,
  RadioIcon,
  ServerIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

export type NavChildren = "floorplan" | "cameras" | "servers";

export type NavItem = {
  href: string;
  title: string;
  icon: LucideIcon;
  children?: NavChildren;
};

type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Monitoring",
    items: [
      { href: "/dashboard", title: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/live", title: "Live View", icon: RadioIcon },
      { href: "/alerts", title: "Alerts", icon: BellIcon },
    ],
  },
  {
    label: "Locations",
    items: [
      {
        href: "/floorplan",
        title: "Floorplan",
        icon: Building2Icon,
        children: "floorplan",
      },
      { href: "/map", title: "Map", icon: MapIcon },
    ],
  },
  {
    label: "Devices",
    items: [
      {
        href: "/cameras",
        title: "Cameras",
        icon: CctvIcon,
        children: "cameras",
      },
      {
        href: "/servers",
        title: "Servers",
        icon: ServerIcon,
        children: "servers",
      },
    ],
  },
  {
    label: "Reports",
    items: [{ href: "/analytics", title: "Analytics", icon: BarChart3Icon }],
  },
  {
    label: "Administration",
    items: [{ href: "/users", title: "Users", icon: UsersIcon }],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export const SETTINGS_ITEM: NavItem = {
  href: "/settings",
  title: "Settings",
  icon: SettingsIcon,
};
