import { NAV_GROUPS, NAV_ITEMS, SETTINGS_ITEM } from "@/config/navigation";

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
