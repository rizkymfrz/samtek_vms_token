import axios, { isAxiosError } from "axios";
import type { z } from "zod";
import { env } from "@/config/env";

export type EdgeTarget = {
  id: string;
  name: string;
  hostAddress: string | null;
  localHostAddress: string | null;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
};

export class EdgeError extends Error {
  constructor(
    readonly edgeId: string,
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const http = axios.create({ timeout: env.EDGE_TIMEOUT_MS });

const baseUrl = (edge: EdgeTarget) => {
  const address = edge.localHostAddress || edge.hostAddress;
  if (!address) throw new EdgeError(edge.id, "Edge has no address");
  return /^https?:\/\//.test(address) ? address : `http://${address}`;
};

const toEdgeError = (edge: EdgeTarget, error: unknown) => {
  if (error instanceof EdgeError) return error;
  if (isAxiosError(error)) {
    if (error.response) {
      return new EdgeError(
        edge.id,
        `Edge responded with ${error.response.status}`,
        error.response.status,
      );
    }
    return new EdgeError(
      edge.id,
      error.code === "ECONNABORTED" ? "Edge timed out" : "Edge unreachable",
    );
  }
  return new EdgeError(edge.id, "Invalid response from edge");
};

export const getFromEdge = async <S extends z.ZodType>(
  edge: EdgeTarget,
  path: string,
  schema: S,
  params?: Record<string, string | number>,
): Promise<z.output<S>> => {
  try {
    const { data } = await http.get<unknown>(path, {
      baseURL: baseUrl(edge),
      params,
    });
    return schema.parse(data);
  } catch (error) {
    throw toEdgeError(edge, error);
  }
};

export const getBinaryFromEdge = async (edge: EdgeTarget, path: string) => {
  try {
    const { data } = await http.get<ArrayBuffer>(path, {
      baseURL: baseUrl(edge),
      responseType: "arraybuffer",
    });
    return data;
  } catch (error) {
    throw toEdgeError(edge, error);
  }
};
