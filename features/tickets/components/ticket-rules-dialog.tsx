"use client";
import { ServerIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Pick } from "@/components/shared/pick";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useRuleToggle, useTicketRules } from "../hooks/use-ticket-rules";

export const TicketRulesDialog = ({
  isOpen,
  servers,
  initialServerId,
  onClose,
}: {
  isOpen: boolean;
  servers: { id: string; name: string }[];
  initialServerId: string | null;
  onClose: () => void;
}) => {
  const [picked, setPicked] = useState<string | null>(null);
  const serverId = picked ?? initialServerId ?? servers[0]?.id ?? null;
  const { data, isPending, error: loadError } = useTicketRules(serverId);
  const { toggle, error } = useRuleToggle(serverId);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        <DialogHeader icon={SlidersHorizontalIcon}>
          <DialogTitle>Ticket rules</DialogTitle>
          <DialogDescription>
            Choose which event kinds create tickets. A change applies to alarms
            received from now on.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <DialogBody>
          <DialogSection>
            <Pick
              label="Server"
              icon={ServerIcon}
              items={servers.map((server) => ({
                value: server.id,
                label: server.name,
              }))}
              value={serverId ?? ""}
              onChange={setPicked}
              className="w-full"
            />
            {isPending && serverId && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}
            {loadError && (
              <FieldError>
                Rules could not be loaded. You may not have access to them.
              </FieldError>
            )}
            {data && data.items.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                This server has not sent any alarms yet. Event kinds show up
                here after their first alarm.
              </p>
            )}
            {data && data.items.length > 0 && (
              <ul className="flex flex-col">
                {data.items.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex items-center justify-between gap-4 border-b py-2 text-xs last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="flex items-center gap-2 font-medium">
                        {rule.kind}
                        {!rule.isReviewed && (
                          <Badge variant="default">New</Badge>
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {rule.analyticId}
                      </span>
                    </div>
                    <Switch
                      checked={rule.isEnabled}
                      disabled={toggle.isPending}
                      aria-label={`Create tickets for ${rule.kind}`}
                      onCheckedChange={(isEnabled) =>
                        toggle.mutate({ id: rule.id, isEnabled })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
            {error && <FieldError>{error}</FieldError>}
          </DialogSection>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
