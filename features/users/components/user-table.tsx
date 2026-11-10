import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RoleOption, UserRecord } from "../types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const UserTable = ({
  users,
  roles,
  onSelect,
}: {
  users: UserRecord[];
  roles: RoleOption[];
  onSelect: (id: string) => void;
}) => {
  const roleName = new Map(roles.map((role) => [role.id, role.name]));
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            tabIndex={0}
            onClick={() => onSelect(user.id)}
            onKeyDown={(event) =>
              event.target === event.currentTarget &&
              event.key === "Enter" &&
              onSelect(user.id)
            }
            className="cursor-pointer outline-none focus-visible:bg-muted"
          >
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground">{user.email}</span>
              </div>
            </TableCell>
            <TableCell>
              {user.platformRoleId ? (
                <Badge variant="secondary">
                  {roleName.get(user.platformRoleId) ?? "Unknown role"}
                </Badge>
              ) : (
                <span className="text-muted-foreground">No role</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.whatsapp ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={user.isActive ? "outline" : "secondary"}>
                {user.isActive ? "Active" : "Disabled"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {formatDate(user.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
