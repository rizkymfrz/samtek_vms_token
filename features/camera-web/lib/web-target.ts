import type { Login } from "./autofill";

export type WebTarget = { origin: string; login: Login | null };

export const webTarget = (source: string): WebTarget | null => {
  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return null;
  }
  if (url.protocol !== "rtsp:" || url.hostname === "") return null;
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  return {
    origin: `http://${url.hostname}`,
    login: user === "" ? null : { user, password },
  };
};

export const webPrefix = (id: string) => `/api/cameras/${id}/web`;
