# Portfolio

Sanjay Dilip's project portfolio, built as an Obsidian-vault-styled site: a file-tree
sidebar, tags, backlinks, and callouts around case studies for featured analytics,
data engineering, and ML/AI projects. Deployed at
[sanjay-dilip.github.io](https://sanjay-dilip.github.io).

## Stack

- [Astro](https://astro.build) (static site, content collections)
- [Vitest](https://vitest.dev) for unit tests
- GitHub Actions → GitHub Pages for deployment

## Structure

```text
/
├── src/
│   ├── content/projects/    # one markdown file per case study
│   ├── content.config.ts    # projects collection schema
│   ├── components/          # vault design-system components (tags, callouts, tabs, backlinks, sidebar)
│   ├── layouts/              # shared page layout
│   ├── lib/                  # graph data/simulation logic + unit tests
│   └── pages/                 # Home, About, Resume, Contact, Projects (index + case study), Graph
├── .github/workflows/deploy.yml   # build + deploy to GitHub Pages on push to main
└── public/
```

## Commands

Run from the project root:

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`      | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build the production site to `./dist/`        |
| `npm run preview`   | Preview the build locally before deploying    |
| `npm run test`      | Run the unit test suite (Vitest)              |
| `npm run astro ...` | Run Astro CLI commands (e.g. `astro check`)   |

## Adding a project case study

Add a new markdown file under `src/content/projects/`, matching the schema in
`src/content.config.ts` (`title`, `summary`, `tags`, `role`, `timeframe`, `github`,
`demo`, `related`, `status`, `order`, `keyResult`, `whatIdImprove`). It's picked up
automatically by the Projects index, the individual case-study page, and the
`/graph` view.
