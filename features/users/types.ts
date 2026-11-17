export type UserRecord = {
  id: string;
  username: string;
  email: string;
  whatsapp: string | null;
  avatar: string | null;
  platformRoleId: string | null;
  isActive: boolean;
  createdAt: string;
};

export type RoleOption = { id: string; name: string };
export type ServerOption = { id: string; name: string };
export type PermissionOption = { code: string; description: string | null };

export type RoleDraft = {
  name: string;
  description: string;
  permissions: string[];
};

export type UserFailure = { source: string; message: string };

export type UsersData = {
  users: UserRecord[];
  roles: RoleOption[];
  servers: ServerOption[];
  failures: UserFailure[];
};
