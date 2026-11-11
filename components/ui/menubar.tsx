"use client";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import { cn } from "cn";
import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Menubar = ({ className, ...props }: MenubarPrimitive.Props) => {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn(
        "flex h-8 items-center gap-0.5 rounded border p-1",
        className,
      )}
      {...props}
    />
  );
};

const MenubarMenu = ({ ...props }: ComponentProps<typeof DropdownMenu>) => {
  return <DropdownMenu data-slot="menubar-menu" {...props} />;
};

const MenubarGroup = ({
  ...props
}: ComponentProps<typeof DropdownMenuGroup>) => {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />;
};

const MenubarPortal = ({
  ...props
}: ComponentProps<typeof DropdownMenuPortal>) => {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />;
};

const MenubarTrigger = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuTrigger>) => {
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded px-2 py-[calc(--spacing(1))] text-xs font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
        className,
      )}
      {...props}
    />
  );
};

const MenubarContent = ({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof DropdownMenuContent>) => {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "min-w-36 rounded bg-popover text-popover-foreground shadow-md duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
        className,
      )}
      {...props}
    />
  );
};

const MenubarItem = ({
  className,
  inset,
  variant = "default",
  ...props
}: ComponentProps<typeof DropdownMenuItem>) => {
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/menubar-item gap-2 rounded px-2 py-2 text-xs focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:bg-destructive data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/80 data-[variant=destructive]:focus:text-destructive-foreground data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive-foreground!",
        className,
      )}
      {...props}
    />
  );
};

const MenubarCheckboxItem = ({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) => {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded py-2 pr-32 pl-8 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
};

const MenubarRadioGroup = ({
  ...props
}: ComponentProps<typeof DropdownMenuRadioGroup>) => {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />;
};

const MenubarRadioItem = ({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) => {
  return (
    <MenuPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded py-2 pr-2 pl-8 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
};

const MenubarLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuLabel> & {
  inset?: boolean;
}) => {
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-2 py-2 text-xs data-inset:pl-8", className)}
      {...props}
    />
  );
};

const MenubarSeparator = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuSeparator>) => {
  return (
    <DropdownMenuSeparator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
};

const MenubarShortcut = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuShortcut>) => {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
};

const MenubarSub = ({ ...props }: ComponentProps<typeof DropdownMenuSub>) => {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />;
};

const MenubarSubTrigger = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean;
}) => {
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "gap-2 rounded px-2 py-2 text-xs focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
};

const MenubarSubContent = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuSubContent>) => {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      className={cn(
        "min-w-32 rounded bg-popover text-popover-foreground shadow-lg duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      {...props}
    />
  );
};

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
