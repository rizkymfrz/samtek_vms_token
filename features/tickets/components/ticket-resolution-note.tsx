import { ClipboardCheckIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { TicketDetail } from "../types";

export const TicketResolutionNote = ({ ticket }: { ticket: TicketDetail }) => {
  if (!ticket.resolutionNote) return null;
  return (
    <Alert className="text-muted-foreground">
      <ClipboardCheckIcon />
      <AlertTitle className="text-[11px] font-normal">
        {ticket.resolutionType === "false_alarm" ? "False alarm" : "Resolution"}
      </AlertTitle>
      <AlertDescription className="font-medium break-words text-foreground">
        {ticket.resolutionNote}
      </AlertDescription>
    </Alert>
  );
};
