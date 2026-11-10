import { EdgeError } from "./edge-client";

export type EdgeFailure = { edgeId: string; edgeName: string; message: string };

export const queryEdges = async <E extends { id: string; name: string }, T>(
  edges: E[],
  query: (edge: E) => Promise<T>,
) => {
  const settled = await Promise.allSettled(edges.map(query));
  const results: { edge: E; data: T }[] = [];
  const failures: EdgeFailure[] = [];
  settled.forEach((outcome, index) => {
    const edge = edges[index];
    if (outcome.status === "fulfilled") {
      results.push({ edge, data: outcome.value });
      return;
    }
    console.error(`[edge ${edge.id}]`, outcome.reason);
    failures.push({
      edgeId: edge.id,
      edgeName: edge.name,
      message:
        outcome.reason instanceof EdgeError
          ? outcome.reason.message
          : "Unexpected error",
    });
  });
  return { results, failures };
};
