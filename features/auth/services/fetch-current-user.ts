import axios from "axios";
import type { CurrentUser } from "../types";

export const fetchCurrentUser = async () =>
  (await axios.get<CurrentUser>("/api/auth/me")).data;
