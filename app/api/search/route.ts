import { connection } from "next/server";
import {
  parseSearchParams,
  SearchInputError,
} from "@/features/object-search/lib/validate-search";
import { searchObjects } from "@/features/object-search/services/get-search";
import { UnauthorizedError } from "@/lib/auth/session";

export const GET = async (request: Request) => {
  await connection();
  try {
    const query = parseSearchParams(new URL(request.url).searchParams);
    return Response.json(await searchObjects(query));
  } catch (error) {
    if (error instanceof SearchInputError) {
      return Response.json(
        { error: error.message, field: error.field },
        { status: 400 },
      );
    }
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/search]", error);
    return Response.json({ error: "Failed to search" }, { status: 502 });
  }
};
