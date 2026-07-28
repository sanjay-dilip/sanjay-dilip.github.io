import type { ProjectEntry } from "./graph-data";

export interface ConnectionsSummary {
  id: string;
  title: string;
  connectionLabels: string[];
}

/**
 * Plain-text connection summary per project — the screen-reader/mobile
 * fallback for the /graph canvas. Tags are listed as "#tag", followed by
 * related project titles. Related entries that don't resolve to a known
 * project slug are skipped, matching buildGraphData's behavior.
 */
export function buildConnectionsSummary(projects: ProjectEntry[]): ConnectionsSummary[] {
  const titleById = new Map(projects.map((project) => [project.id, project.data.title]));

  return projects.map((project) => {
    const tagLabels = project.data.tags.map((tag) => `#${tag}`);
    const relatedLabels = project.data.related
      .map((relatedId) => titleById.get(relatedId))
      .filter((title): title is string => Boolean(title));

    return {
      id: project.id,
      title: project.data.title,
      connectionLabels: [...tagLabels, ...relatedLabels],
    };
  });
}
