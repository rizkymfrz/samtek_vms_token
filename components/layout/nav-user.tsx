"use client";
import axios from "axios";
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SETTINGS_ITEM } from "@/config/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { CurrentUser } from "@/features/auth/types";

const initialsOf = (name: string) =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const UserInfo = ({ user }: { user: CurrentUser | undefined }) => {
  const name = user?.username ?? "Loading…";
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={user?.avatar ?? undefined} alt={name} />
        <AvatarFallback className="rounded-lg">
          {user ? initialsOf(user.username) : ""}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user?.email ?? " "}
        </span>
      </div>
    </>
  );
};

export const NavUser = () => {
  const { isMobile } = useSidebar();
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const handleLogout = async () => {
    await axios.post("/api/auth/logout").catch(() => {});
    router.replace("/login");
    router.refresh();
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" tooltip={user?.username} />}
          >
            <UserInfo user={user} />
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 p-1 text-foreground">
                <UserInfo user={user} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={SETTINGS_ITEM.href} />}>
                <SETTINGS_ITEM.icon />
                {SETTINGS_ITEM.title}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOutIcon />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
