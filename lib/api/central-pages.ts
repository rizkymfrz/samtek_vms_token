import type { AxiosInstance } from "axios";
import { z } from "zod";
import { toCentralError } from "./central-client";

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

export const fetchAllPages = async <S extends z.ZodType>(
  client: AxiosInstance,
  path: string,
  item: S,
  params: Record<string, string | number> = {},
) => {
  const schema = z.object({
    data: z.array(item),
    meta: z.object({ total: z.number().int().nonnegative() }),
  });
  const items: z.output<S>[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { data } = await client.get<unknown>(path, {
        params: { ...params, page, pageSize: PAGE_SIZE },
      });
      const body = schema.parse(data);
      items.push(...body.data);
      if (page * PAGE_SIZE >= body.meta.total) break;
    }
  } catch (error) {
    throw toCentralError(error);
  }
  return items;
};
