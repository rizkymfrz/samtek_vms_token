import axios from "axios";
import { env } from "@/config/env";

export const createCentralClient = (token: string) => {
  if (!env.CENTRAL_API_URL) throw new Error("CENTRAL_API_URL is not set");
  return axios.create({
    baseURL: env.CENTRAL_API_URL,
    timeout: 10_000,
    headers: { Authorization: `Bearer ${token}` },
  });
};
