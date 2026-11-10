import { cookies } from "next/headers";
import { z } from "zod";
import { isLiveSource } from "@/config/env";
import { CentralError } from "@/lib/api/central-client";
import { setAuthCookies } from "@/lib/auth/session";
import { login } from "@/lib/auth/tokens";

const bodySchema = z.object({
  identifier: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(1024),
});

export const POST = async (request: Request) => {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return Response.json(
      { error: "Enter your username and password" },
      { status: 400 },
    );
  }
  if (!isLiveSource) return Response.json({ ok: true });
  try {
    const tokens = await login(body.data.identifier, body.data.password);
    setAuthCookies(await cookies(), tokens);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof CentralError && error.status < 500) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/login]", error);
    return Response.json({ error: "Sign-in is unavailable" }, { status: 502 });
  }
};
