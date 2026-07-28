const TAG_ID_PREFIX = "tag:";

export interface ProjectEntry {
  id: string;
  data: {
    title: string;
    tags: string[];
    related: string[];
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: "project" | "tag";
  href?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraphData(projects: ProjectEntry[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenTagIds = new Set<string>();
  const seenEdgeKeys = new Set<string>();
  const projectIds = new Set(projects.map((project) => project.id));

  function addEdge(source: string, target: string): void {
    const key = [source, target].sort().join("|");
    if (seenEdgeKeys.has(key)) return;
    seenEdgeKeys.add(key);
    edges.push({ source, target });
  }

  for (const project of projects) {
    nodes.push({
      id: project.id,
      label: project.data.title,
      type: "project",
      href: `/projects/${project.id}`,
    });

    for (const tag of project.data.tags) {
      const tagId = `${TAG_ID_PREFIX}${tag}`;
      if (!seenTagIds.has(tagId)) {
        seenTagIds.add(tagId);
        nodes.push({ id: tagId, label: tag, type: "tag" });
      }
      addEdge(project.id, tagId);
    }

    // Skip related entries that don't resolve to a known project slug,
    // since frontmatter is hand-authored and can drift from actual filenames.
    for (const relatedId of project.data.related) {
      if (!projectIds.has(relatedId)) continue;
      addEdge(project.id, relatedId);
    }
  }

  return { nodes, edges };
}
