"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EndpointFields, SCOPES } from "./endpoint-fields";
import { useEndpointsForm } from "../hooks/use-endpoints-form";

export const EndpointsSettings = () => {
  const form = useEndpointsForm();
  const { isDirty, isApplying, active, save, discard } = form;
  return (
    <form noValidate onSubmit={save} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {SCOPES.map(({ scope, title, description, icon }) => (
          <Card key={scope}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {icon}
                {title}
                {active === scope && <Badge>In use</Badge>}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <EndpointFields scope={scope} form={form} />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={!isDirty || isApplying}>
          {isApplying ? "Applying…" : "Save settings"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!isDirty || isApplying}
          onClick={discard}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
