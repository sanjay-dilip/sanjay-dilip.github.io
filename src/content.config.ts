import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    role: z.string(),
    timeframe: z.string(),
    github: z.string().url(),
    demo: z.string().url().nullable().default(null),
    related: z.array(z.string()).default([]),
    status: z.enum(["deployed", "in progress", "archived"]),
    order: z.number(),
    keyResult: z.string(),
    whatIdImprove: z.string(),
  }),
});

export const collections = { projects };
