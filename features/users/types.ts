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
export type UserFailure = { source: string; message: string };

export type UsersData = {
  users: UserRecord[];
  roles: RoleOption[];
  failures: UserFailure[];
};
