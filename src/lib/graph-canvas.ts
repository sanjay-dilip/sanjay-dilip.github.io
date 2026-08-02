import { stepSimulation, type SimEdge, type SimNode } from "./graph-simulation";
import { computeVisibleNodeIds, findNodeAtPoint, getConnectedNodeIds } from "./graph-interactions";
import type { GraphData, GraphNode } from "./graph-data";

const PROJECT_RADIUS = 9;
const TAG_RADIUS = 6;
const HIT_PADDING = 4;
const DRAG_MOVE_THRESHOLD = 4;
const ALPHA_DECAY = 0.99;
const ALPHA_MIN = 0.02;

interface RenderNode extends SimNode {
  graphNode: GraphNode;
}

/**
 * Fetches /graph-data.json and renders an interactive force-directed graph
 * into the given canvas: drag to reposition, hover to highlight connections,
 * click a project node to navigate, click a tag node to filter.
 */
export async function initGraphCanvas(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const response = await fetch("/graph-data.json");
  const graph: GraphData = await response.json();
  const edges: SimEdge[] = graph.edges.map((edge) => ({ source: edge.source, target: edge.target }));

  let width = 0;
  let height = 0;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  const nodes: RenderNode[] = graph.nodes.map((graphNode, index) => {
    const angle = (index / graph.nodes.length) * Math.PI * 2;
    const layoutRadius = Math.min(width, height) / 3 || 100;
    return {
      id: graphNode.id,
      graphNode,
      x: width / 2 + Math.cos(angle) * layoutRadius,
      y: height / 2 + Math.sin(angle) * layoutRadius,
      vx: 0,
      vy: 0,
    };
  });
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  let alpha = 1;
  let hoveredId: string | null = null;
  let activeTagId: string | null = null;
  let dragNode: RenderNode | null = null;
  let dragMoved = false;

  function cssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function pointerToCanvas(event: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function radiusFor(node: RenderNode): number {
    return node.graphNode.type === "project" ? PROJECT_RADIUS : TAG_RADIUS;
  }

  function draw(): void {
    const bg = cssVar("--bg-elevated");
    const borderColor = cssVar("--border");
    const accent = cssVar("--accent");
    const fgMuted = cssVar("--fg-muted");
    const fg = cssVar("--fg");

    ctx!.clearRect(0, 0, width, height);
    ctx!.fillStyle = bg;
    ctx!.fillRect(0, 0, width, height);

    const visible = computeVisibleNodeIds(graph.nodes, graph.edges, activeTagId);
    const highlighted = hoveredId ? getConnectedNodeIds(graph.edges, hoveredId) : new Set<string>();

    for (const edge of graph.edges) {
      if (!visible.has(edge.source) || !visible.has(edge.target)) continue;
      const source = nodesById.get(edge.source);
      const target = nodesById.get(edge.target);
      if (!source || !target) continue;
      const isHighlighted =
        hoveredId !== null && (edge.source === hoveredId || edge.target === hoveredId);
      ctx!.strokeStyle = isHighlighted ? accent : borderColor;
      ctx!.lineWidth = isHighlighted ? 1.6 : 1;
      ctx!.beginPath();
      ctx!.moveTo(source.x, source.y);
      ctx!.lineTo(target.x, target.y);
      ctx!.stroke();
    }

    for (const node of nodes) {
      if (!visible.has(node.id)) continue;
      const isHovered = node.id === hoveredId;
      const isConnectedToHover = highlighted.has(node.id);
      const radius = radiusFor(node) * (isHovered ? 1.25 : 1);

      ctx!.beginPath();
      ctx!.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx!.fillStyle = node.graphNode.type === "project" ? accent : fgMuted;
      ctx!.globalAlpha = hoveredId && !isHovered && !isConnectedToHover ? 0.45 : 1;
      ctx!.fill();
      ctx!.globalAlpha = 1;

      ctx!.font = "11px var(--font-mono, monospace)";
      ctx!.fillStyle = fg;
      ctx!.textBaseline = "middle";
      ctx!.fillText(node.graphNode.label, node.x + radius + 4, node.y);
    }
  }

  function tick(): void {
    if (alpha > ALPHA_MIN) {
      const scaled = {
        width,
        height,
        repulsionStrength: 6000 * alpha,
        springStrength: 0.015 * alpha,
        centeringStrength: 0.006 * alpha,
      };
      stepSimulation(nodes, edges, scaled);
      alpha *= ALPHA_DECAY;
    }
    draw();
    requestAnimationFrame(tick);
  }

  canvas.addEventListener("pointerdown", (event) => {
    const point = pointerToCanvas(event);
    const hit = findNodeAtPoint(nodes, point.x, point.y, Math.max(PROJECT_RADIUS, TAG_RADIUS) + HIT_PADDING);
    if (!hit) return;
    dragNode = hit;
    dragMoved = false;
    hit.fixed = true;
    alpha = 1;
    canvas.setAttribute("data-dragging", "true");
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    const point = pointerToCanvas(event);
    if (dragNode) {
      if (Math.hypot(point.x - dragNode.x, point.y - dragNode.y) > DRAG_MOVE_THRESHOLD) {
        dragMoved = true;
      }
      dragNode.x = point.x;
      dragNode.y = point.y;
      return;
    }
    const hit = findNodeAtPoint(nodes, point.x, point.y, Math.max(PROJECT_RADIUS, TAG_RADIUS) + HIT_PADDING);
    hoveredId = hit ? hit.id : null;
  });

  canvas.addEventListener("pointerup", (event) => {
    canvas.releasePointerCapture(event.pointerId);
    canvas.removeAttribute("data-dragging");
    if (!dragNode) return;
    const node = dragNode;
    node.fixed = false;
    dragNode = null;
    if (dragMoved) return;

    if (node.graphNode.type === "project" && node.graphNode.href) {
      window.location.href = node.graphNode.href;
    } else if (node.graphNode.type === "tag") {
      activeTagId = activeTagId === node.id ? null : node.id;
    }
  });

  canvas.addEventListener("pointerleave", () => {
    if (!dragNode) hoveredId = null;
  });

  const themeObserver = new MutationObserver(draw);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);

  requestAnimationFrame(tick);
}
