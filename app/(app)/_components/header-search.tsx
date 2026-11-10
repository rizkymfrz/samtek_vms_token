"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CameraIcon, SearchIcon, ServerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { CAMERAS, SERVERS } from "./dummy-data";
import { NAV_ITEMS, SETTINGS_ITEM } from "./nav";

export const HeaderSearch = () => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  return (
    <>
      <Button
        variant="outline"
        className="w-8 justify-center text-muted-foreground lg:w-56 lg:justify-start"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <SearchIcon />
        <span className="hidden lg:inline">Search...</span>
        <Kbd className="ml-auto hidden lg:inline-flex">Ctrl K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Jump to a page, camera or server."
      >
        <Command>
          <CommandInput placeholder="Search pages, cameras, servers..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
              {[...NAV_ITEMS, SETTINGS_ITEM].map(
                ({ href, title, icon: Icon }) => (
                  <CommandItem
                    key={href}
                    value={`page ${title}`}
                    onSelect={() => go(href)}
                  >
                    <Icon />
                    {title}
                  </CommandItem>
                ),
              )}
            </CommandGroup>
            <CommandGroup heading="Cameras">
              {CAMERAS.map((camera) => (
                <CommandItem
                  key={camera.id}
                  value={`camera ${camera.name}`}
                  onSelect={() => go("/cameras")}
                >
                  <CameraIcon />
                  {camera.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Servers">
              {SERVERS.map((server) => (
                <CommandItem
                  key={server.id}
                  value={`server ${server.name}`}
                  onSelect={() => go("/servers")}
                >
                  <ServerIcon />
                  {server.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};
