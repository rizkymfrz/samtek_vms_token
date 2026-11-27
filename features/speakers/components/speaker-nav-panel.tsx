"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidePanel } from "@/components/layout/side-panel";
import { SPEAKER_NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

export const SpeakerNavPanel = () => {
  const pathname = usePathname();
  return (
    <SidePanel>
      <nav aria-label="Speakers" className="flex flex-col gap-1">
        {SPEAKER_NAV_ITEMS.map(({ href, title, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded p-2 text-sm outline-hidden before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-sidebar-primary before:opacity-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent [&>svg]:size-5 [&>svg]:shrink-0",
                isActive && "font-medium before:opacity-100",
              )}
            >
              <Icon />
              <span>{title}</span>
            </Link>
          );
        })}
      </nav>
    </SidePanel>
  );
};
