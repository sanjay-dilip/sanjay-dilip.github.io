export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
}

export interface SimEdge {
  source: string;
  target: string;
}

export interface SimulationOptions {
  width: number;
  height: number;
  repulsionStrength?: number;
  springLength?: number;
  springStrength?: number;
  centeringStrength?: number;
  damping?: number;
}

const DEFAULTS = {
  repulsionStrength: 2400,
  springLength: 90,
  springStrength: 0.02,
  centeringStrength: 0.01,
  damping: 0.85,
};

const MIN_DISTANCE = 1;

/**
 * Advances the force simulation by one tick, mutating node positions/velocities
 * in place: pairwise repulsion, spring attraction along edges, and a weak pull
 * toward the canvas center so the graph doesn't drift off-screen.
 */
export function stepSimulation(nodes: SimNode[], edges: SimEdge[], options: SimulationOptions): void {
  const repulsionStrength = options.repulsionStrength ?? DEFAULTS.repulsionStrength;
  const springLength = options.springLength ?? DEFAULTS.springLength;
  const springStrength = options.springStrength ?? DEFAULTS.springStrength;
  const centeringStrength = options.centeringStrength ?? DEFAULTS.centeringStrength;
  const damping = options.damping ?? DEFAULTS.damping;
  const centerX = options.width / 2;
  const centerY = options.height / 2;
  const byId = new Map(nodes.map((node) => [node.id, node]));

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let distanceSq = dx * dx + dy * dy;
      if (distanceSq < MIN_DISTANCE) {
        dx = Math.random() - 0.5;
        dy = Math.random() - 0.5;
        distanceSq = MIN_DISTANCE;
      }
      const force = repulsionStrength / distanceSq;
      const distance = Math.sqrt(distanceSq);
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
  }

  for (const edge of edges) {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) continue;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DISTANCE);
    const displacement = distance - springLength;
    const force = displacement * springStrength;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;
    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  }

  for (const node of nodes) {
    node.vx += (centerX - node.x) * centeringStrength;
    node.vy += (centerY - node.y) * centeringStrength;
  }

  for (const node of nodes) {
    if (node.fixed) {
      node.vx = 0;
      node.vy = 0;
      continue;
    }
    node.vx *= damping;
    node.vy *= damping;
    node.x += node.vx;
    node.y += node.vy;
  }
}
