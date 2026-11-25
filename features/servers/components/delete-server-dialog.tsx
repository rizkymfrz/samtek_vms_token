import { Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { canDelete } from "../lib/edit-server";
import type { ServerRecord } from "../types";

export const DeleteServerDialog = ({
  server,
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  server: ServerRecord | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}) => {
  const isDeletable = server !== null && canDelete(server);
  return (
    <ConfirmDialog
      isOpen={isOpen && server !== null}
      icon={Trash2Icon}
      variant="destructive"
      title="Delete this edge server?"
      description={
        isDeletable || server === null
          ? "The edge server is removed from the system."
          : "Move or delete its cameras first."
      }
      confirmLabel="Delete edge server"
      isConfirmDisabled={!isDeletable}
      onClose={() => onOpenChange(false)}
      onConfirm={() => {
        onOpenChange(false);
        onConfirm();
      }}
    />
  );
};
