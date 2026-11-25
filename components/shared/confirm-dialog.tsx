import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export const ConfirmDialog = ({
  isOpen,
  icon,
  variant = "default",
  title,
  description,
  confirmLabel,
  isConfirmDisabled = false,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  icon: LucideIcon;
  variant?: "default" | "destructive";
  title: string;
  description: ReactNode;
  confirmLabel: string;
  isConfirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={isOpen}
      disablePointerDismissal
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader icon={icon} variant={variant}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Separator />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={variant}
            disabled={isConfirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
