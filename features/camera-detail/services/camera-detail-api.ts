import type { Perimeters } from "@/lib/api/perimeters";
import { http } from "@/lib/axios/browser-client";

export const savePerimeters = async (
  camera: { id: string; edgeServerId: string },
  perimeters: Perimeters,
) => {
  await http.patch(
    `/api/edge-servers/${camera.edgeServerId}/devices/${camera.id}`,
    { perimeters },
  );
};
