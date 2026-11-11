"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Row } from "../_components/layout"
import {
  alertDialog,
  commandGroups,
  common,
  dialog,
  drawer,
  hoverCard,
  menu,
  popover,
  sheet,
  tooltip,
} from "../_data/content"

export const DialogDemo = () => {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>
        {dialog.trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialog.title}</DialogTitle>
          <DialogDescription>{dialog.description}</DialogDescription>
        </DialogHeader>
        <Separator />
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            {common.cancel}
          </DialogClose>
          <Button>{common.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const AlertDialogDemo = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        {alertDialog.trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {alertDialog.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{common.cancel}</AlertDialogCancel>
          <AlertDialogAction>{common.continue}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const SheetDemo = () => {
  return (
    <Row>
      {sheet.side.map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="secondary" />}>
            {side}
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>{dialog.title}</SheetTitle>
              <SheetDescription>{dialog.description}</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose render={<Button variant="secondary" />}>
                {common.close}
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </Row>
  )
}

export const DrawerDemo = () => {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="secondary" />}>
        {drawer.trigger}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{drawer.title}</DrawerTitle>
          <DrawerDescription>{drawer.description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>{common.confirm}</Button>
          <DrawerClose render={<Button variant="secondary" />}>
            {common.cancel}
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export const PopoverDemo = () => {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>
        {popover.trigger}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>{popover.title}</PopoverTitle>
          <PopoverDescription>{popover.body}</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

export const TooltipDemo = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>
          {tooltip.trigger}
        </TooltipTrigger>
        <TooltipContent>{tooltip.body}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const HoverCardDemo = () => {
  return (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link" />}>
        {hoverCard.trigger}
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm font-medium">{hoverCard.title}</p>
        <p className="text-sm text-muted-foreground">{hoverCard.body}</p>
      </HoverCardContent>
    </HoverCard>
  )
}

export const DropdownMenuDemo = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        {menu.trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
          {menu.items.map((item) => (
            <DropdownMenuItem key={item.id}>
              {item.label}
              <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>
          {menu.checkbox}
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value={menu.radio[0].value}>
          {menu.radio.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{menu.subTrigger}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {menu.subItems.map((label) => (
              <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">{menu.danger}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const ContextMenuDemo = () => {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-full max-w-sm items-center justify-center border border-dashed text-sm text-muted-foreground">
        {menu.contextArea}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {menu.items.map((item) => (
          <ContextMenuItem key={item.id}>
            {item.label}
            <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export const CommandDemo = () => {
  return (
    <Command className="max-w-sm border">
      <CommandInput placeholder={common.placeholder} />
      <CommandList>
        <CommandEmpty>{common.noResults}</CommandEmpty>
        {commandGroups.map((group, index) => (
          <div key={group.id}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((label) => (
                <CommandItem key={label}>{label}</CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </Command>
  )
}
