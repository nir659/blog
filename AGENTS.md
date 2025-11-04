# Repository Guidelines

## Application Overview
- Terminal-inspired blog landing page built on the Next.js 16 App Router with React 19 Client Components.
- Left column lists posts in collapsible directory groups; right column renders Markdown content chosen by the reader.
- Markdown files in `app/posts/` are served as plain text through `app/api/posts/[slug]/route.ts` and rendered with `react-markdown` plus `remark-gfm`.
- Tailwind CSS 4 powers the monospace layout; `app/globals.css` defines theme tokens such as `--grid-lines`.

## Project Structure & Module Organization
- `app/page.tsx` drives the landing experience, including the static `posts` directory listing until a CMS is introduced.
- Shared UI lives in `app/components/`; keep file names kebab-case and exports PascalCase (e.g., `directory-post-list.tsx` → `DirectoryPostList`).
- Utility helpers live in `app/lib/`, like Markdown loaders and post-grouping functions.
- Markdown sources stay under `app/posts/`; slugs must match the file name (e.g., `my-post.md` → slug `my-post`).
- Tailwind styles load from `app/globals.css`; extend design tokens in `:root` before creating new CSS files.
- Static assets live in `public/`; tweak behavior via `next.config.ts`, `eslint.config.mjs`, and `postcss.config.mjs`.

## Content Authoring Workflow
- Add new content as Markdown files in `app/posts/` and keep filenames kebab-case.
- Register each post in the `posts` array inside `app/page.tsx` with `category`, `title`, `slug`, and optional `date` so it appears in the directory.
- Prefer GitHub-flavored Markdown; code fences render automatically with the existing renderer.

## Build, Test, and Development Commands
- `npm run dev` — start the Next.js dev server at `http://localhost:3000` with hot reload.
- `npm run build` — generate the production bundle; use before shipping changes that touch routing or config.
- `npm run start` — run the production build locally; useful for validating SSR behavior.
- `npm run lint` — run ESLint with the Next.js Core Web Vitals ruleset; fix lint issues before opening a PR.

## Coding Style & Naming Conventions
- Default to TypeScript (`.tsx` for React, `.ts` for helpers); type props explicitly.
- Honor 2-space indentation and the Next.js/Prettier defaults.
- Components and hooks use PascalCase, helpers camelCase, constants SCREAMING_SNAKE_CASE.
- Name nested routes after the URL (e.g. `app/(posts)/archive/page.tsx`) and co-locate related components beside the route.
- Cluster Tailwind classes by layout → spacing → typography and reach for `clsx` once a list grows long.

## Testing Guidelines
- No automated suite ships yet, so pair any feature with tests in the same PR.
- Favor Vitest + React Testing Library placed in `__tests__/` folders next to the code under test.
- Use snapshots sparingly for layout atoms and cover flows like rendering the latest posts with integration tests.
- Capture manual QA steps in the PR until CI is wired up.

## Commit & Pull Request Guidelines
- History only shows the Create Next App scaffold; adopt Conventional Commits (`feat:`, `fix:`, `chore:`) going forward.
- Keep subjects under 72 characters, in imperative mood, and avoid “WIP” commits.
- PRs should outline motivation, summarize key deltas, and flag migrations or new env vars.
- Link issues when available and provide screenshots for UI-facing changes.
- Confirm `npm run lint` and any tests have passed; if work remains, state the follow-up plan explicitly.

## Environment & Configuration Tips
- Store secrets in `.env.local` and document keys in the PR when they change.
- Note asset sources (fonts, images) in the PR and prefer CDN links over binary commits.
