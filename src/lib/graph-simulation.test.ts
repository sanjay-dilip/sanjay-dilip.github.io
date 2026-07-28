import { describe, expect, it } from "vitest";
import { stepSimulation, type SimNode } from "./graph-simulation";

function node(id: string, x: number, y: number): SimNode {
  return { id, x, y, vx: 0, vy: 0 };
}

describe("stepSimulation", () => {
  it("pushes coincident nodes apart via repulsion", () => {
    const nodes = [node("a", 100, 100), node("b", 100, 100)];
    stepSimulation(nodes, [], { width: 200, height: 200 });

    const [a, b] = nodes;
    const distance = Math.hypot(a.x - b.x, a.y - b.y);
    expect(distance).toBeGreaterThan(0);
  });

  it("pulls edge-connected nodes closer together over time", () => {
    const nodes = [node("a", 0, 0), node("b", 500, 0)];
    const edges = [{ source: "a", target: "b" }];
    const initialDistance = 500;

    for (let i = 0; i < 60; i += 1) {
      stepSimulation(nodes, edges, { width: 500, height: 500 });
    }

    const [a, b] = nodes;
    const finalDistance = Math.hypot(a.x - b.x, a.y - b.y);
    expect(finalDistance).toBeLessThan(initialDistance);
  });

  it("pulls an isolated node toward the canvas center", () => {
    const nodes = [node("a", 10, 10)];
    const center = { x: 100, y: 100 };
    const initialDistance = Math.hypot(nodes[0].x - center.x, nodes[0].y - center.y);

    for (let i = 0; i < 30; i += 1) {
      stepSimulation(nodes, [], { width: 200, height: 200 });
    }

    const finalDistance = Math.hypot(nodes[0].x - center.x, nodes[0].y - center.y);
    expect(finalDistance).toBeLessThan(initialDistance);
  });

  it("does not move a fixed node and zeroes its velocity", () => {
    const nodes = [node("a", 50, 50), node("b", 300, 300)];
    nodes[0].fixed = true;

    stepSimulation(nodes, [], { width: 400, height: 400 });

    expect(nodes[0].x).toBe(50);
    expect(nodes[0].y).toBe(50);
    expect(nodes[0].vx).toBe(0);
    expect(nodes[0].vy).toBe(0);
  });
});
