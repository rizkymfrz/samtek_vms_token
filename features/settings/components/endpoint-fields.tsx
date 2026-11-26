"use client";
import { CloudIcon, ServerIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { EndpointScope } from "@/config/endpoints";
import type { EndpointsForm } from "../hooks/use-endpoints-form";

export const SCOPES: {
  scope: EndpointScope;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
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
];

export const EndpointFields = ({
  scope,
  form,
}: {
  scope: EndpointScope;
  form: EndpointsForm;
}) => {
  const { formId, register, errors, placeholders } = form;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field data-invalid={!!errors[scope]?.centralUrl}>
        <FieldLabel htmlFor={`${formId}-${scope}-central`}>
          Central API URL
        </FieldLabel>
        <Input
          id={`${formId}-${scope}-central`}
          placeholder={placeholders[scope].centralUrl}
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
          placeholder={placeholders[scope].mqttUrl}
          autoComplete="off"
          {...register(`${scope}.mqttUrl`)}
          aria-invalid={!!errors[scope]?.mqttUrl}
        />
        {errors[scope]?.mqttUrl && (
          <FieldError>{errors[scope].mqttUrl.message}</FieldError>
        )}
      </Field>
    </div>
  );
};
