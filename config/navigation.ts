import {
  BarChart3Icon,
  BellIcon,
  Building2Icon,
  CctvIcon,
  FileAudioIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MapIcon,
  RadioIcon,
  RewindIcon,
  ScanSearchIcon,
  ServerIcon,
  SettingsIcon,
  TicketIcon,
  UsersIcon,
  Volume2Icon,
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
      { href: "/live", title: "Live view", icon: RadioIcon },
      { href: "/playback", title: "Playback", icon: RewindIcon },
      { href: "/alerts", title: "Alarms", icon: BellIcon },
      { href: "/search", title: "Object search", icon: ScanSearchIcon },
      { href: "/tickets", title: "Tickets", icon: TicketIcon },
    ],
  },
  {
    label: "Locations",
    items: [
      {
        href: "/floorplan",
        title: "Floor plans",
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
        title: "Edge servers",
        icon: ServerIcon,
        children: "servers",
      },
      { href: "/speakers", title: "Speakers", icon: Volume2Icon },
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

export const SPEAKER_NAV_ITEMS: NavItem[] = [
  { href: "/speakers", title: "Speakers", icon: Volume2Icon },
  { href: "/speakers/audio", title: "Audio", icon: FileAudioIcon },
  { href: "/speakers/history", title: "Play history", icon: HistoryIcon },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export const SETTINGS_ITEM: NavItem = {
  href: "/settings",
  title: "Settings",
  icon: SettingsIcon,
};
