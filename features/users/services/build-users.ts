import type { UsersData } from "../types";

export const buildUsers = (): UsersData => ({
  failures: [],
  roles: [
    { id: "1", name: "super_admin" },
    { id: "2", name: "operator" },
    { id: "3", name: "viewer" },
  ],
  users: [
    {
      id: "1",
      username: "rizky.maulana",
      email: "rizky@samtek.id",
      whatsapp: "+628123456789",
      avatar: null,
      platformRoleId: "1",
      isActive: true,
      createdAt: "2026-10-01T08:00:00.000Z",
    },
    {
      id: "2",
      username: "budi.santoso",
      email: "budi@samtek.id",
      whatsapp: null,
      avatar: null,
      platformRoleId: "2",
      isActive: true,
      createdAt: "2026-10-12T09:30:00.000Z",
    },
    {
      id: "3",
      username: "sari.wulan",
      email: "sari@samtek.id",
      whatsapp: "+628987654321",
      avatar: null,
      platformRoleId: "3",
      isActive: true,
      createdAt: "2026-10-20T13:15:00.000Z",
    },
    {
      id: "4",
      username: "tamu.gudang",
      email: "tamu@samtek.id",
      whatsapp: null,
      avatar: null,
      platformRoleId: null,
      isActive: false,
      createdAt: "2026-11-02T10:45:00.000Z",
    },
  ],
});
