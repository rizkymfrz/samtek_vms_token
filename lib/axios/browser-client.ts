import axios from "axios";

const LOGIN_PATH = "/login";
export const http = axios.create();

http.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    !window.location.pathname.startsWith(LOGIN_PATH) &&
    !error.config?.url?.startsWith("/api/auth/login")
  ) {
    const next = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.replace(`${LOGIN_PATH}?next=${next}`);
  }
  return Promise.reject(error);
});

export const messageOf = (
  error: unknown,
  fallback = "Something went wrong. Try again.",
) =>
  axios.isAxiosError(error) && typeof error.response?.data?.error === "string"
    ? error.response.data.error
    : fallback;
