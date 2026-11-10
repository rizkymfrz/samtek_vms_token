import { http } from "@/lib/axios/browser-client";
import type { LiveData, LiveLayout, LiveLayoutSummary } from "../types";

export const fetchLive = async () =>
  (await http.get<LiveData>("/api/live")).data;

export const fetchLayout = async (id: string) =>
  (await http.get<LiveLayout>(`/api/layouts/${id}`)).data;

export const createLayoutRequest = async (input: {
  name: string;
  rows: number;
  columns: number;
  isDefault?: boolean;
}) => (await http.post<LiveLayoutSummary>("/api/layouts", input)).data;

export const resizeLayoutRequest = async (
  id: string,
  size: { rows: number; columns: number },
) => (await http.patch<LiveLayoutSummary>(`/api/layouts/${id}`, size)).data;

export const deleteLayoutRequest = async (id: string) => {
  await http.delete(`/api/layouts/${id}`);
};

export const replaceSlotsRequest = async (
  id: string,
  slots: (string | null)[],
) =>
  (
    await http.put<LiveLayout>(`/api/layouts/${id}/devices`, {
      devices: slots.flatMap((deviceRecordId, index) =>
        deviceRecordId ? [{ position: index + 1, deviceRecordId }] : [],
      ),
    })
  ).data;
