import { http } from "@/lib/axios/browser-client";
import type { EnrolledFace, FacesData } from "../types";

export const fetchFaces = async () =>
  (await http.get<FacesData>("/api/faces")).data;

export const enrollFace = async (form: FormData): Promise<EnrolledFace> => {
  const { data } = await http.post<{
    face: { face_id: string; person_id: string };
  }>("/api/faces", form);
  return { faceId: data.face.face_id, personId: data.face.person_id };
};

export const deleteFace = async (edgeId: string, faceId: string) => {
  await http.delete(`/api/faces/${edgeId}/${faceId}`);
};

export const fetchCapture = async (url: string) => {
  const { data } = await http.get<Blob>(url, { responseType: "blob" });
  return new File([data], "capture.jpg", { type: "image/jpeg" });
};
