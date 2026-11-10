import { http } from "@/lib/axios/browser-client";

export type Credentials = { identifier: string; password: string };

export const signIn = async (credentials: Credentials) => {
  await http.post("/api/auth/login", credentials);
};

export const signOut = async () => {
  await http.post("/api/auth/logout");
};
