import { describe, expect, it } from "vitest";
import {
  computeVisibleNodeIds,
  findNodeAtPoint,
  getConnectedEdgeIndices,
  getConnectedNodeIds,
} from "./graph-interactions";
import type { GraphEdge, GraphNode } from "./graph-data";

describe("findNodeAtPoint", () => {
  const nodes = [
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 100, y: 100 },
  ];

  it("returns the node whose radius contains the point", () => {
    expect(findNodeAtPoint(nodes, 2, 2, 10)?.id).toBe("a");
  });

  it("returns null when no node is within radius", () => {
    expect(findNodeAtPoint(nodes, 500, 500, 10)).toBeNull();
  });

  it("returns the topmost (last) node when two nodes overlap", () => {
    const overlapping = [
      { id: "under", x: 0, y: 0 },
      { id: "over", x: 1, y: 1 },
    ];
    expect(findNodeAtPoint(overlapping, 0, 0, 20)?.id).toBe("over");
  });
});

describe("getConnectedNodeIds / getConnectedEdgeIndices", () => {
  const edges: GraphEdge[] = [
    { source: "a", target: "tag:x" },
    { source: "b", target: "tag:x" },
    { source: "a", target: "b" },
  ];

  it("finds neighbors regardless of edge direction", () => {
    expect(getConnectedNodeIds(edges, "tag:x")).toEqual(new Set(["a", "b"]));
    expect(getConnectedNodeIds(edges, "a")).toEqual(new Set(["tag:x", "b"]));
  });

  it("finds all edge indices touching a node", () => {
    expect(getConnectedEdgeIndices(edges, "a")).toEqual([0, 2]);
  });

  it("returns empty results for a node with no edges", () => {
    expect(getConnectedNodeIds(edges, "isolated")).toEqual(new Set());
    expect(getConnectedEdgeIndices(edges, "isolated")).toEqual([]);
  });
});

describe("computeVisibleNodeIds", () => {
  const nodes: GraphNode[] = [
    { id: "a", label: "A", type: "project", href: "/projects/a" },
    { id: "b", label: "B", type: "project", href: "/projects/b" },
    { id: "c", label: "C", type: "project", href: "/projects/c" },
    { id: "tag:x", label: "x", type: "tag" },
  ];
  const edges: GraphEdge[] = [
    { source: "a", target: "tag:x" },
    { source: "b", target: "tag:x" },
  ];

  it("shows every node when no tag filter is active", () => {
    expect(computeVisibleNodeIds(nodes, edges, null)).toEqual(new Set(["a", "b", "c", "tag:x"]));
  });

  it("shows only the active tag and its connected projects", () => {
    expect(computeVisibleNodeIds(nodes, edges, "tag:x")).toEqual(new Set(["tag:x", "a", "b"]));
  });
});
