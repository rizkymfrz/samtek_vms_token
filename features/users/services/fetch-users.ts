import { http } from "@/lib/axios/browser-client";
import type { UsersData } from "../types";

export const fetchUsers = async () =>
  (await http.get<UsersData>("/api/users")).data;
