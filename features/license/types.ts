import type { z } from "zod";
import type { licenseSchema } from "./schemas/license";

export type EdgeLicense = z.output<typeof licenseSchema>;
export type LicenseFeature = EdgeLicense["features"][number];
