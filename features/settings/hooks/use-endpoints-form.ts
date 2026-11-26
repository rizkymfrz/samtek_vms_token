import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  type Endpoints,
  type EndpointScope,
  endpointsSchema,
  hostnameOf,
  isManualLocal,
  scopeOf,
} from "@/config/endpoints";
import { useLocalAddress } from "./use-local-address";
import { applyEndpointsCookie, endpointsStore } from "../lib/endpoints-store";

type Draft = z.input<typeof endpointsSchema>;

const RELOAD_DELAY_MS = 400;
const NO_DERIVED = "Default from the installation";

const CLOUD_PLACEHOLDERS = {
  centralUrl: "e.g. https://central.example.com/api",
  mqttUrl: "e.g. wss://vms.example.com/mqtt",
};

const subscribeNothing = () => () => {};
const currentHostname = () => hostnameOf(window.location.hostname);

export const useEndpointsForm = () => {
  const formId = useId();
  const { status, value } = useSyncExternalStore(
    endpointsStore.subscribe,
    endpointsStore.getSnapshot,
    endpointsStore.getServerSnapshot,
  );
  const hostname = useSyncExternalStore(
    subscribeNothing,
    currentHostname,
    () => "",
  );
  const active: EndpointScope | null = hostname ? scopeOf(hostname) : null;
  const derived = useLocalAddress();
  const placeholders = {
    local: {
      centralUrl: derived?.centralUrl || NO_DERIVED,
      mqttUrl: derived?.mqttUrl || NO_DERIVED,
    },
    cloud: CLOUD_PLACEHOLDERS,
  };
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
    const next = {
      ...endpoints,
      isLocalManual: derived ? isManualLocal(endpoints.local, derived) : false,
    };
    endpointsStore.update(() => next);
    applyEndpointsCookie(next);
    setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
  });
  const discard = useCallback(() => reset(value), [reset, value]);
  return {
    formId,
    register,
    errors,
    isDirty,
    isApplying,
    active,
    placeholders,
    save,
    discard,
  };
};

export type EndpointsForm = ReturnType<typeof useEndpointsForm>;
