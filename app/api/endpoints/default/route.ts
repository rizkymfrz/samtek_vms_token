import { headers } from "next/headers";
import { connection } from "next/server";
import { hostnameOf, localCentralUrl } from "@/config/endpoints";
import { env } from "@/config/env";

export const GET = async () => {
  await connection();
  const hostname = hostnameOf((await headers()).get("host"));
  const centralUrl = hostname
    ? localCentralUrl(hostname, env.CENTRAL_API_URL)
    : (env.CENTRAL_API_URL ?? "");
  return Response.json(
    { centralUrl },
    { headers: { "Cache-Control": "no-store" } },
  );
};
