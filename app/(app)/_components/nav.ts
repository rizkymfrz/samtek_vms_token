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

export type Crumb = { label: string; href?: string };

const humanize = (segment: string) =>
  segment.replace(/[-_]/g, " ").replace(/^\w/, (char) => char.toUpperCase());

export const getBreadcrumbs = (pathname: string): Crumb[] => {
  const [root, ...rest] = pathname.split("/").filter(Boolean);
  if (!root) return [];
  const group = NAV_GROUPS.find((g) =>
    g.items.some((i) => i.href === `/${root}`),
  );
  const page = [...NAV_ITEMS, SETTINGS_ITEM].find((i) => i.href === `/${root}`);
  const crumbs: Crumb[] = [];
  if (group) crumbs.push({ label: group.label });
  crumbs.push({ label: page?.title ?? humanize(root), href: `/${root}` });
  rest.forEach((segment, index) => {
    crumbs.push({
      label: humanize(segment),
      href: `/${[root, ...rest.slice(0, index + 1)].join("/")}`,
    });
  });
  return crumbs;
};
