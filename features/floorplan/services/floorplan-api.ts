import { http } from "@/lib/axios/browser-client";
import type { Floorplan, FloorplanData, FloorplanDevice } from "../types";

export const fetchFloorplan = async () =>
  (await http.get<FloorplanData>("/api/floorplan")).data;

export const createFloorplanRequest = async (input: {
  name: string;
  groupId: string;
  parentId?: string;
}) => (await http.post<Pick<Floorplan, "id">>("/api/floorplans", input)).data;

export const replacePlacementsRequest = async (
  id: string,
  placements: FloorplanDevice[],
) => {
  await http.put(`/api/floorplans/${id}/devices`, {
    devices: placements.map(
      ({ deviceRecordId, x, y, rotation, fieldOfView }) => ({
        deviceRecordId,
        x: Math.round(x * 1e6) / 1e6,
        y: Math.round(y * 1e6) / 1e6,
        rotation,
        fieldOfView,
      }),
    ),
  });
};

export const uploadImageRequest = async (id: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  await http.put(`/api/floorplans/${id}/image`, form);
};

export const deleteFloorplanRequest = async (id: string) => {
  await http.delete(`/api/floorplans/${id}`);
};
