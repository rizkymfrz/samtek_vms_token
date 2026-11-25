import {
  ActivityIcon,
  CalendarIcon,
  EllipsisIcon,
  MessageCircleIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  onDelete,
}: {
  users: UserRecord[];
  roles: RoleOption[];
  onSelect: (id: string) => void;
  onDelete: (user: UserRecord) => void;
}) => {
  const roleName = new Map(roles.map((role) => [role.id, role.name]));
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead icon={UserIcon}>User</TableHead>
          <TableHead icon={ShieldIcon}>Platform role</TableHead>
          <TableHead icon={MessageCircleIcon}>WhatsApp</TableHead>
          <TableHead icon={ActivityIcon}>Status</TableHead>
          <TableHead icon={CalendarIcon}>Created</TableHead>
          <TableHead icon={EllipsisIcon} className="text-right">
            Actions
          </TableHead>
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
                  {roleName.get(user.platformRoleId) ?? "Unknown platform role"}
                </Badge>
              ) : (
                <span className="text-muted-foreground">No role</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.whatsapp ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={`Delete ${user.username}`}
                  title={`Delete ${user.username}`}
                  onClick={() => onDelete(user)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
