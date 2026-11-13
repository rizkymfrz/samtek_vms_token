import type { UserRecord } from "../types";

export const ALL = "all";

export type Filters = {
  query: string;
  status: string;
  role: string;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  status: ALL,
  role: ALL,
};

export const isFiltered = (filters: Filters) =>
  filters.query.trim() !== "" || filters.status !== ALL || filters.role !== ALL;

export const filterUsers = (users: UserRecord[], filters: Filters) => {
  const needle = filters.query.trim().toLowerCase();
  return users.filter(
    (user) =>
      (filters.status === ALL ||
        user.isActive === (filters.status === "active")) &&
      (filters.role === ALL || user.platformRoleId === filters.role) &&
      (!needle ||
        `${user.username} ${user.email}`.toLowerCase().includes(needle)),
  );
};

export const countByRole = (users: UserRecord[], filters: Filters) => {
  const counts: Record<string, number> = {};
  for (const user of filterUsers(users, { ...filters, role: ALL })) {
    if (user.platformRoleId) {
      counts[user.platformRoleId] = (counts[user.platformRoleId] ?? 0) + 1;
    }
  }
  return counts;
};
