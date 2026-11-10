import { http } from "@/lib/axios/browser-client";
import type { ServersData } from "../types";

export const fetchServers = async () =>
  (await http.get<ServersData>("/api/servers")).data;
