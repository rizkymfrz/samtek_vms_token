import { LINK_HEADER } from "@/features/tickets/services/ticket-link-source";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export const readLinkToken = (request: Request) => {
  const token = request.headers.get(LINK_HEADER)?.trim() ?? "";
  return TOKEN_PATTERN.test(token) ? token : null;
};

export const noToken = () =>
  Response.json(
    { error: "This link is invalid or no longer active" },
    { status: 410 },
  );
