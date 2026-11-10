import axios from "axios";
import type { AlertsData } from "../types";

export const fetchAlerts = async () =>
  (await axios.get<AlertsData>("/api/alerts")).data;
