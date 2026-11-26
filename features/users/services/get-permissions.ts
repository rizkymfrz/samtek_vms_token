import { createCentralClient } from "@/lib/api/central-client";
import { fetchAllPages } from "@/lib/api/central-pages";
import { requireAccessToken } from "@/lib/auth/session";
import { permissionSchema } from "../schemas/user";

export const getPermissions = async () => {
  const client = createCentralClient(await requireAccessToken());
  return fetchAllPages(client, "/v1/permissions", permissionSchema);
};
