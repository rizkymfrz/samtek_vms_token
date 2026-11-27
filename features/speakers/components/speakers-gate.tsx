import { connection } from "next/server";
import type { ReactNode } from "react";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { getSpeakersIfAllowed } from "../services/get-speakers";
import type { SpeakersData } from "../types";

export const SpeakersGate = async ({
  render,
}: {
  render: (data: SpeakersData) => ReactNode;
}) => {
  await connection();
  const data = await redirectIfUnauthorized(getSpeakersIfAllowed());
  if (!data) {
    return (
      <p className="p-8 text-center text-xs text-muted-foreground">
        You do not have permission to view speakers.
      </p>
    );
  }
  return render(data);
};
