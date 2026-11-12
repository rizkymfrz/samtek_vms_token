import {
  ActivityIcon,
  CalendarIcon,
  MessageCircleIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
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
          <TableHead icon={UserIcon}>User</TableHead>
          <TableHead icon={ShieldIcon}>Role</TableHead>
          <TableHead icon={MessageCircleIcon}>WhatsApp</TableHead>
          <TableHead icon={ActivityIcon}>Status</TableHead>
          <TableHead icon={CalendarIcon}>Created</TableHead>
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
