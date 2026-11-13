"use client";
import { MonitorIcon, PlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { usePersistedStore } from "@/hooks/use-persisted-store";
import { cn } from "@/lib/utils";
import { findAnalyticGroup } from "../lib/analytic-groups";
import {
  analyticsTabsStore,
  closeTab,
  nextSlugAfterClose,
  openTab,
} from "../lib/analytics-tabs-store";
import {
  getOverviewPage,
  getServerOverviewPage,
  subscribeOverviewPage,
} from "../lib/overview-page";

const ROOT = "/analytics";

const tabClassName =
  "relative flex h-12 shrink-0 items-center gap-2 px-4 text-sm text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:after:bg-primary";

const slugOf = (pathname: string) => {
  const [, root, slug] = pathname.split("/");
  return `/${root}` === ROOT && slug ? slug : null;
};

export const AnalyticsTabs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { status, value } = usePersistedStore(analyticsTabsStore);
  const overviewPage = useSyncExternalStore(
    subscribeOverviewPage,
    getOverviewPage,
    getServerOverviewPage,
  );
  const overviewHref =
    overviewPage === 0 ? ROOT : `${ROOT}?page=${overviewPage + 1}`;
  const activeSlug = slugOf(pathname);
  const isReady = status === "ready";
  const slugs = isReady ? value.slugs : activeSlug ? [activeSlug] : [];
  useLayoutEffect(() => {
    if (isReady && activeSlug) {
      analyticsTabsStore.update((state) => openTab(state, activeSlug));
    }
  }, [isReady, activeSlug]);
  const close = (slug: string) => {
    const next = nextSlugAfterClose(slugs, slug);
    analyticsTabsStore.update((state) => closeTab(state, slug));
    if (slug === activeSlug) {
      router.push(next ? `${ROOT}/${next}` : ROOT);
    }
  };
  return (
    <nav
      aria-label="Analytics tabs"
      className="flex shrink-0 items-center overflow-x-auto border-b bg-sidebar"
    >
      <Link
        href={overviewHref}
        data-active={activeSlug === null}
        aria-current={activeSlug === null ? "page" : undefined}
        className={tabClassName}
      >
        <MonitorIcon className="size-5" aria-hidden />
        Overview
      </Link>
      {slugs.map((slug) => {
        const group = findAnalyticGroup(slug);
        if (!group) return null;
        const Icon = group.icon;
        const isActive = slug === activeSlug;
        return (
          <div
            key={slug}
            data-active={isActive}
            className={cn(tabClassName, "max-w-72 pr-2")}
          >
            <Link
              href={`${ROOT}/${slug}`}
              aria-current={isActive ? "page" : undefined}
              className="flex min-w-0 items-center gap-2"
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="truncate">{group.title}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Close ${group.title}`}
              onClick={() => close(slug)}
            >
              <XIcon />
            </Button>
          </div>
        );
      })}
      <Button
        variant="ghost"
        size="icon"
        aria-label="New tab"
        className="mx-2 shrink-0"
        nativeButton={false}
        render={<Link href={ROOT} />}
      >
        <PlusIcon />
      </Button>
    </nav>
  );
};
