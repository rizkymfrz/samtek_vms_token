import { http } from "@/lib/axios/browser-client";
import type { LiveData, LiveLayout, LiveLayoutSummary } from "../types";

export const fetchLive = async () =>
  (await http.get<LiveData>("/api/live")).data;

export const fetchLayout = async (id: string) =>
  (await http.get<LiveLayout>(`/api/layouts/${id}`)).data;

export const createLayoutRequest = async (input: {
  name: string;
  isDefault?: boolean;
}) => (await http.post<LiveLayoutSummary>("/api/layouts", input)).data;

export const deleteLayoutRequest = async (id: string) => {
  await http.delete(`/api/layouts/${id}`);
};

export const replaceCamerasRequest = async (id: string, cameras: string[]) =>
  (
    await http.put<LiveLayout>(`/api/layouts/${id}/devices`, {
      devices: cameras.map((deviceRecordId, index) => ({
        position: index + 1,
        deviceRecordId,
      })),
    })
  ).data;
