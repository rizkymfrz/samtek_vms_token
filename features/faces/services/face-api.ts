import { http } from "@/lib/axios/browser-client";
import type { FacesData } from "../types";

export const fetchFaces = async () =>
  (await http.get<FacesData>("/api/faces")).data;

export const enrollFace = async (form: FormData) => {
  await http.post("/api/faces", form);
};

export const deleteFace = async (edgeId: string, faceId: string) => {
  await http.delete(`/api/faces/${edgeId}/${faceId}`);
};
