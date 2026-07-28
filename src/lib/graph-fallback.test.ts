import { describe, expect, it } from "vitest";
import { buildConnectionsSummary } from "./graph-fallback";
import type { ProjectEntry } from "./graph-data";

describe("buildConnectionsSummary", () => {
  it("lists tags as #tag labels followed by resolved related project titles", () => {
    const projects: ProjectEntry[] = [
      {
        id: "nba-win-probability-engine",
        data: {
          title: "NBA Win Probability Engine",
          tags: ["machine-learning", "cloud", "deployed"],
          related: ["sim2real-engagement"],
        },
      },
      {
        id: "sim2real-engagement",
        data: { title: "Sim2Real User Engagement Analysis", tags: [], related: [] },
      },
    ];

    const summary = buildConnectionsSummary(projects);

    expect(summary[0]).toEqual({
      id: "nba-win-probability-engine",
      title: "NBA Win Probability Engine",
      connectionLabels: ["#machine-learning", "#cloud", "#deployed", "Sim2Real User Engagement Analysis"],
    });
  });

  it("skips related entries that don't resolve to a known project", () => {
    const projects: ProjectEntry[] = [
      { id: "a", data: { title: "A", tags: ["python"], related: ["does-not-exist"] } },
    ];

    expect(buildConnectionsSummary(projects)[0].connectionLabels).toEqual(["#python"]);
  });

  it("returns an empty connection list for a project with no tags or related entries", () => {
    const projects: ProjectEntry[] = [{ id: "a", data: { title: "A", tags: [], related: [] } }];

    expect(buildConnectionsSummary(projects)[0].connectionLabels).toEqual([]);
  });

  it("preserves one summary entry per input project, in order", () => {
    const projects: ProjectEntry[] = [
      { id: "a", data: { title: "A", tags: [], related: [] } },
      { id: "b", data: { title: "B", tags: [], related: [] } },
    ];

    expect(buildConnectionsSummary(projects).map((entry) => entry.id)).toEqual(["a", "b"]);
  });
});
