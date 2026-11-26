import type { z } from "zod";
import { http } from "@/lib/axios/browser-client";
import type { licenseResponseSchema } from "../schemas/license";

export const fetchLicense = async (serverId: string) =>
  (
    await http.get<z.output<typeof licenseResponseSchema>>(
      `/api/edge-servers/${serverId}/license`,
    )
  ).data.data;
