import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildGraphData } from "../lib/graph-data";

export const GET: APIRoute = async () => {
  const projects = await getCollection("projects");
  const graph = buildGraphData(projects);

  return new Response(JSON.stringify(graph), {
    headers: { "Content-Type": "application/json" },
  });
};
