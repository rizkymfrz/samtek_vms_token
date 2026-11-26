"use client";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SETTINGS_ITEM } from "@/config/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { useCurrentUser } from "../hooks/use-current-user";
import { useSignOut } from "../hooks/use-sign-out";
import type { CurrentUser } from "../types";

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
      <Avatar>
        <AvatarImage src={user?.avatar ?? undefined} alt={name} />
        <AvatarFallback>{user ? initialsOf(user.username) : ""}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user?.email ?? " "}
        </span>
      </div>
    </>
  );
};

export const UserMenu = () => {
  const pathname = usePathname();
  const { data } = useCurrentUser();
  const user = useIsClient() ? data : undefined;
  const router = useRouter();
  const signOut = useSignOut();
  const handleLogout = () =>
    signOut.mutate(undefined, {
      onSettled: () => {
        router.replace("/login");
        router.refresh();
      },
    });
  return (
    <>
      <div
        title={user?.username}
        className="flex h-12 items-center gap-2 overflow-hidden p-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0.5"
      >
        <UserInfo user={user} />
      </div>
      <SidebarSeparator className="mx-0" />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={SETTINGS_ITEM.title}
            isActive={pathname.startsWith(SETTINGS_ITEM.href)}
            render={<Link href={SETTINGS_ITEM.href} />}
          >
            <SETTINGS_ITEM.icon />
            <span>{SETTINGS_ITEM.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Sign out"
            className="text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOutIcon />
            <span>Sign out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
};
