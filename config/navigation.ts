import {
  BarChart3Icon,
  BellIcon,
  CameraIcon,
  Building2Icon,
  LayoutDashboardIcon,
  MapIcon,
  RadioIcon,
  ServerIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; title: string; icon: LucideIcon };
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
      { href: "/floorplan", title: "Floorplan", icon: Building2Icon },
      { href: "/map", title: "Map", icon: MapIcon },
    ],
  },
  {
    label: "Devices",
    items: [
      { href: "/cameras", title: "Cameras", icon: CameraIcon },
      { href: "/servers", title: "Servers", icon: ServerIcon },
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
