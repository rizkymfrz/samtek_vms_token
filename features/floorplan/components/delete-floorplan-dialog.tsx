import { Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
    <ConfirmDialog
      isOpen={isOpen && plan !== null}
      icon={Trash2Icon}
      variant="destructive"
      title="Delete this floor plan?"
      description={
        hasChildren
          ? "The floor plan, the plans nested under it and their camera placements are removed. This cannot be undone."
          : "The floor plan and its camera placements are removed. This cannot be undone."
      }
      confirmLabel="Delete floor plan"
      onClose={() => onOpenChange(false)}
      onConfirm={() => {
        onOpenChange(false);
        onConfirm();
      }}
    />
  );
};
