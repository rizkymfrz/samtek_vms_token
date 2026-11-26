import { z } from "zod";

const schema = z.object({ centralUrl: z.string() });

let pending: Promise<string> | null = null;

export const fetchInstalledCentral = () => {
  pending ??= fetch("/api/endpoints/default", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((body) => schema.parse(body).centralUrl)
    .catch(() => {
      pending = null;
      return "";
    });
  return pending;
};
