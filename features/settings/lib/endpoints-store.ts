import {
  EMPTY_ENDPOINTS,
  type Endpoints,
  endpointsCookieString,
  endpointsSchema,
  readEndpointsCookie,
} from "@/config/endpoints";
import { createPersistedStore } from "@/lib/storage/create-persisted-store";

export const endpointsStore = createPersistedStore<Endpoints>({
  key: "settings:endpoints",
  version: 1,
  schema: endpointsSchema,
  initial: EMPTY_ENDPOINTS,
});

export const applyEndpointsCookie = (endpoints: Endpoints) => {
  const current = readEndpointsCookie() ?? EMPTY_ENDPOINTS;
  if (JSON.stringify(current) === JSON.stringify(endpoints)) return false;
  document.cookie = endpointsCookieString(endpoints);
  return JSON.stringify(readEndpointsCookie()) === JSON.stringify(endpoints);
};
