import type { GraphEdge, GraphNode } from "./graph-data";

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

/**
 * Returns the topmost node (last in draw order) whose hit radius contains the
 * given point, or null if none match.
 */
export function findNodeAtPoint<T extends PositionedNode>(
  nodes: T[],
  x: number,
  y: number,
  radius: number
): T | null {
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    if (Math.hypot(node.x - x, node.y - y) <= radius) {
      return node;
    }
  }
  return null;
}

/** Node ids directly connected to the given node by an edge, excluding itself. */
export function getConnectedNodeIds(edges: GraphEdge[], nodeId: string): Set<string> {
  const connected = new Set<string>();
  for (const edge of edges) {
    if (edge.source === nodeId) connected.add(edge.target);
    if (edge.target === nodeId) connected.add(edge.source);
  }
  return connected;
}

/** Indices into `edges` of every edge touching the given node. */
export function getConnectedEdgeIndices(edges: GraphEdge[], nodeId: string): number[] {
  const indices: number[] = [];
  edges.forEach((edge, index) => {
    if (edge.source === nodeId || edge.target === nodeId) indices.push(index);
  });
  return indices;
}

/**
 * Node ids that should be visible when `activeTagId` is the active filter:
 * the tag node itself plus every node directly connected to it. When
 * `activeTagId` is null, every node is visible (no filter applied).
 */
export function computeVisibleNodeIds(nodes: GraphNode[], edges: GraphEdge[], activeTagId: string | null): Set<string> {
  if (activeTagId === null) {
    return new Set(nodes.map((node) => node.id));
  }
  const visible = new Set<string>([activeTagId]);
  for (const neighborId of getConnectedNodeIds(edges, activeTagId)) {
    visible.add(neighborId);
  }
  return visible;
}
