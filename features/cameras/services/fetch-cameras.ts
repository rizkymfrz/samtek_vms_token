import { http } from "@/lib/axios/browser-client";
import type { CameraData } from "../types";

export const fetchCameras = async () =>
  (await http.get<CameraData>("/api/cameras")).data;
