import { z } from "zod";
import { http } from "@/lib/axios/browser-client";

const schema = z.object({ centralUrl: z.string() });

export const fetchInstalledCentral = async () => {
  const { data } = await http.get<unknown>("/api/endpoints/default");
  return schema.parse(data).centralUrl;
};
