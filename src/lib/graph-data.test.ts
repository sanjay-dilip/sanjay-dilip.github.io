import { describe, expect, it } from "vitest";
import { buildGraphData, type ProjectEntry } from "./graph-data";

function project(overrides: Partial<ProjectEntry> & { id: string }): ProjectEntry {
  return {
    data: { title: overrides.id, tags: [], related: [] },
    ...overrides,
  };
}

describe("buildGraphData", () => {
  it("creates a project node with a case-study href for each project", () => {
    const { nodes } = buildGraphData([
      project({ id: "nba-win-probability-engine", data: { title: "NBA Win Probability Engine", tags: [], related: [] } }),
    ]);

    expect(nodes).toContainEqual({
      id: "nba-win-probability-engine",
      label: "NBA Win Probability Engine",
      type: "project",
      href: "/projects/nba-win-probability-engine",
    });
  });

  it("dedupes tag nodes shared across multiple projects", () => {
    const { nodes } = buildGraphData([
      project({ id: "a", data: { title: "A", tags: ["machine-learning"], related: [] } }),
      project({ id: "b", data: { title: "B", tags: ["machine-learning"], related: [] } }),
    ]);

    const tagNodes = nodes.filter((node) => node.type === "tag");
    expect(tagNodes).toEqual([{ id: "tag:machine-learning", label: "machine-learning", type: "tag" }]);
  });

  it("creates one edge per project-tag pairing", () => {
    const { edges } = buildGraphData([
      project({ id: "a", data: { title: "A", tags: ["nlp", "python"], related: [] } }),
    ]);

    expect(edges).toContainEqual({ source: "a", target: "tag:nlp" });
    expect(edges).toContainEqual({ source: "a", target: "tag:python" });
    expect(edges).toHaveLength(2);
  });

  it("creates a project-to-project edge for related entries that resolve to a known project", () => {
    const { edges } = buildGraphData([
      project({ id: "nba-win-probability-engine", data: { title: "NBA", tags: [], related: ["sim2real-engagement"] } }),
      project({ id: "sim2real-engagement", data: { title: "Sim2Real", tags: [], related: [] } }),
    ]);

    expect(edges).toContainEqual({ source: "nba-win-probability-engine", target: "sim2real-engagement" });
    expect(edges).toHaveLength(1);
  });

  it("skips related entries that don't resolve to a known project slug", () => {
    const { edges } = buildGraphData([
      project({ id: "a", data: { title: "A", tags: [], related: ["does-not-exist"] } }),
    ]);

    expect(edges).toHaveLength(0);
  });

  it("does not duplicate an edge when two projects mutually reference each other", () => {
    const { edges } = buildGraphData([
      project({ id: "a", data: { title: "A", tags: [], related: ["b"] } }),
      project({ id: "b", data: { title: "B", tags: [], related: ["a"] } }),
    ]);

    expect(edges).toHaveLength(1);
  });
});
