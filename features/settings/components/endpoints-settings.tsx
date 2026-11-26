"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudIcon, ServerIcon } from "lucide-react";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { PasswordInput } from "@/components/shared/password-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type Endpoints,
  type EndpointScope,
  endpointsSchema,
  hostnameOf,
  scopeOf,
} from "@/config/endpoints";
import { applyEndpointsCookie, endpointsStore } from "../lib/endpoints-store";

type Draft = z.input<typeof endpointsSchema>;

const RELOAD_DELAY_MS = 400;

const SCOPES = [
  {
    scope: "local",
    title: "Local address",
    description: "Used when the VMS is opened by IP address or a local name",
    icon: <ServerIcon className="size-4" />,
  },
  {
    scope: "cloud",
    title: "Cloud address",
    description: "Used when the VMS is opened by a domain name",
    icon: <CloudIcon className="size-4" />,
  },
] as const;

const subscribeNothing = () => () => {};

const currentScope = (): EndpointScope =>
  scopeOf(hostnameOf(window.location.hostname));

export const EndpointsSettings = () => {
  const formId = useId();
  const { status, value } = useSyncExternalStore(
    endpointsStore.subscribe,
    endpointsStore.getSnapshot,
    endpointsStore.getServerSnapshot,
  );
  const active = useSyncExternalStore(
    subscribeNothing,
    currentScope,
    () => null,
  );
  const [isApplying, setIsApplying] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Draft, unknown, Endpoints>({
    resolver: zodResolver(endpointsSchema),
    defaultValues: value,
  });
  useEffect(() => {
    if (status === "ready") reset(value);
  }, [status, value, reset]);
  const save = handleSubmit((endpoints) => {
    setIsApplying(true);
    endpointsStore.update(() => endpoints);
    applyEndpointsCookie(endpoints);
    setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
  });
  return (
    <form noValidate onSubmit={save} className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-2">
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
            <CardContent className="flex flex-col gap-4">
              <Field data-invalid={!!errors[scope]?.centralUrl}>
                <FieldLabel htmlFor={`${formId}-${scope}-central`}>
                  Central API URL
                </FieldLabel>
                <Input
                  id={`${formId}-${scope}-central`}
                  placeholder="e.g. http://192.168.1.10:3000"
                  autoComplete="off"
                  {...register(`${scope}.centralUrl`)}
                  aria-invalid={!!errors[scope]?.centralUrl}
                />
                {errors[scope]?.centralUrl && (
                  <FieldError>{errors[scope].centralUrl.message}</FieldError>
                )}
              </Field>
              <Field data-invalid={!!errors[scope]?.mqttUrl}>
                <FieldLabel htmlFor={`${formId}-${scope}-mqtt`}>
                  MQTT WebSocket URL
                </FieldLabel>
                <Input
                  id={`${formId}-${scope}-mqtt`}
                  placeholder="e.g. ws://192.168.1.10:9001"
                  autoComplete="off"
                  {...register(`${scope}.mqttUrl`)}
                  aria-invalid={!!errors[scope]?.mqttUrl}
                />
                {errors[scope]?.mqttUrl && (
                  <FieldError>{errors[scope].mqttUrl.message}</FieldError>
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${formId}-${scope}-user`}>
                    MQTT username
                  </FieldLabel>
                  <Input
                    id={`${formId}-${scope}-user`}
                    autoComplete="off"
                    {...register(`${scope}.mqttUsername`)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${formId}-${scope}-password`}>
                    MQTT password
                  </FieldLabel>
                  <PasswordInput
                    id={`${formId}-${scope}-password`}
                    autoComplete="new-password"
                    {...register(`${scope}.mqttPassword`)}
                  />
                </Field>
              </div>
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
          onClick={() => reset(value)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
