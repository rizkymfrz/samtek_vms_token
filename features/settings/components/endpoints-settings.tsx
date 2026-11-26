"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EndpointFields, SCOPES } from "./endpoint-fields";
import { useEndpointsForm } from "../hooks/use-endpoints-form";

export const EndpointsSettings = () => {
  const form = useEndpointsForm();
  const { isDirty, isApplying, active, save, discard } = form;
  return (
    <form noValidate onSubmit={save} className="grid gap-4 lg:grid-cols-2">
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
          <CardFooter className="mt-auto gap-2 *:flex-1">
            <Button
              type="button"
              variant="secondary"
              disabled={!isDirty || isApplying}
              onClick={discard}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isApplying}>
              {isApplying ? "Applying…" : "Save settings"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </form>
  );
};
