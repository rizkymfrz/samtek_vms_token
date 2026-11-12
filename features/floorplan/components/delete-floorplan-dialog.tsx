import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Floorplan } from "../types";

export const DeleteFloorplanDialog = ({
  plan,
  isOpen,
  hasChildren,
  onOpenChange,
  onConfirm,
}: {
  plan: Floorplan | null;
  isOpen: boolean;
  hasChildren: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}) => {
  return (
    <AlertDialog open={isOpen && plan !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {plan && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {plan.label}?</AlertDialogTitle>
              <AlertDialogDescription>
                {hasChildren
                  ? "The floor plan, the plans nested under it and their camera placements are removed. This cannot be undone."
                  : "The floor plan and its camera placements are removed. This cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  onConfirm();
                }}
              >
                Delete floor plan
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
