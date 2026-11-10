import { cookies } from "next/headers";
import { isLiveSource } from "@/config/env";
import { loginInputSchema } from "@/features/auth/schemas/login";
import { CentralError } from "@/lib/api/central-client";
import { setAuthCookies } from "@/lib/auth/session";
import { login } from "@/lib/auth/tokens";

export const POST = async (request: Request) => {
  const body = loginInputSchema.safeParse(
    await request.json().catch(() => null),
  );
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
