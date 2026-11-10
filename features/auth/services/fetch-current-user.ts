import { http } from "@/lib/axios/browser-client";
import type { CurrentUser } from "../types";

export const fetchCurrentUser = async () =>
  (await http.get<CurrentUser>("/api/auth/me")).data;
