"use client";
import { Building2Icon, CctvIcon, SearchIcon, ServerIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { NAV_ITEMS, SETTINGS_ITEM } from "@/config/navigation";

type Entry = { id: string; name: string };

export const HeaderSearch = ({
  cameras,
  servers,
  floorplans,
}: {
  cameras: Entry[];
  servers: Entry[];
  floorplans: Entry[];
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => {
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
        variant="secondary"
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
        description="Jump to a page, camera, floor plan or server."
      >
        <Command>
          <CommandInput placeholder="Search pages, cameras, floor plans, servers..." />
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
              {cameras.map((camera) => (
                <CommandItem
                  key={camera.id}
                  value={`camera ${camera.name}`}
                  onSelect={() => go(`/cameras/${camera.id}`)}
                >
                  <CctvIcon />
                  {camera.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Floorplans">
              {floorplans.map((plan) => (
                <CommandItem
                  key={plan.id}
                  value={`floorplan ${plan.name}`}
                  onSelect={() => go(`/floorplan?id=${plan.id}`)}
                >
                  <Building2Icon />
                  {plan.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Servers">
              {servers.map((server) => (
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
