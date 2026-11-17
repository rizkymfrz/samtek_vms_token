import { connection } from "next/server";
import {
  getLinkTicket,
  linkErrorResponse,
} from "@/features/tickets/services/ticket-link-source";
import { noToken, readLinkToken } from "../token";

export const GET = async (request: Request) => {
  await connection();
  const token = readLinkToken(request);
  if (!token) return noToken();
  try {
    return Response.json(await getLinkTicket(token), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return linkErrorResponse(error, "api/ticket-link");
  }
};
