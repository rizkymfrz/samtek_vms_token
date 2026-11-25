import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ConfirmDialog = ({
  isOpen,
  icon: Icon,
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
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }
          >
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            disabled={isConfirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
