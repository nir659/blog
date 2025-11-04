# Minimal Blog

A terminal-themed blog landing page built with Next.js 16. The site presents Nir's journal of experiments with a collapsible directory of posts on the left and Markdown-rendered content on the right.

## Features
- Collapsible directory groups posts by category with a terminal-style UI.
- Markdown content (including GitHub-flavored Markdown) is rendered on demand with `react-markdown` and `remark-gfm`.
- Posts live as plain `.md` files under `app/posts` and are served through a lightweight App Router API.
- Responsive layout with a monospace aesthetic powered by Tailwind CSS 4.

## Tech Stack
- Next.js 16 (App Router)
- React 19 with Client Components
- TypeScript
- Tailwind CSS 4
- React Markdown + Remark GFM

## Getting Started
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm run dev
   ```
   Visit `http://localhost:3000` to view the site.

## Available Scripts
- `pnpm dev` — launch the Next.js dev server with hot reloading.
- `pnpm build` — create an optimized production bundle.
- `pnpm start` — serve the production build locally.
- `pnpm run lint` — run ESLint with the Next.js Core Web Vitals ruleset.

## Content Authoring
- Add new posts as Markdown files inside `app/posts/` (e.g. `app/posts/my-post.md`). The API at `/api/posts/[slug]` serves these files as plain text for the reader.
- Update the `posts` array in `app/page.tsx` so the directory can display the new entry. Each record accepts a `category`, `title`, `slug`, and optional `date`.
- Markdown supports code blocks, tables, and other GFM syntax out of the box.

## Project Structure
```text
app/
├── components/          # Landing page UI primitives
├── lib/                 # Utility helpers for grouping posts & loading content
├── api/posts/[slug]/    # API route serving Markdown by slug
├── posts/               # Markdown sources
├── layout.tsx           # Root layout shell
└── page.tsx             # Main landing page with directory + reader
```

## API
- `GET /api/posts/{slug}` — responds with raw Markdown for the matching file in `app/posts`. Returns `404` if the slug does not exist.

## Testing
No automated suite ships yet. When adding features, co-locate Vitest + React Testing Library specs inside `__tests__/` folders next to the components under test. Capture manual QA notes in PR descriptions until CI is available.

## Contributing
Follow the coding and workflow guidelines in `AGENTS.md` for module organization, naming conventions, testing expectations, and release hygiene.
