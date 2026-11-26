"use client";
import { ServerCogIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { EndpointFields, SCOPES } from "./endpoint-fields";
import { useEndpointsForm } from "../hooks/use-endpoints-form";

export const EndpointsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useEndpointsForm();
  const { formId, isApplying, active, save, discard } = form;
  const close = () => {
    discard();
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit addresses"
            title="Edit addresses"
            onClick={() => setIsOpen(true)}
          />
        }
      >
        <ServerCogIcon />
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader icon={ServerCogIcon}>
          <DialogTitle>Edit addresses</DialogTitle>
          <DialogDescription>
            Change the details of these addresses.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <DialogBody>
          <form id={formId} noValidate className="contents" onSubmit={save}>
            <DialogSection>
              {SCOPES.map(({ scope, title, description, icon }, index) => (
                <Fragment key={scope}>
                  {index > 0 && <Separator />}
                  <div className="flex flex-col gap-1">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      {icon}
                      {title}
                      {active === scope && <Badge>In use</Badge>}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <EndpointFields
                    scope={scope}
                    form={form}
                    className="sm:grid-cols-2"
                  />
                </Fragment>
              ))}
            </DialogSection>
          </form>
        </DialogBody>
        <Separator />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isApplying}>
            {isApplying ? "Applying…" : "Save settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
