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
  return (
    <AlertDialog open={isOpen && server !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {server && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {server.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                {canDelete(server)
                  ? "The edge server is removed from the system. This cannot be undone."
                  : `It still has ${server.cameraCount} cameras. Move or delete them first; an edge server with cameras cannot be deleted.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!canDelete(server)}
                onClick={() => {
                  onOpenChange(false);
                  onConfirm();
                }}
              >
                Delete edge server
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
