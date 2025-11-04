# Repository Guidelines

## Project Structure & Module Organization
- `app/page.tsx` drives the landing page; `app/layout.tsx` wraps global shells.
- Shared UI belongs in `app/components/`; keep file names kebab-case and exports PascalCase.
- Tailwind styles load from `app/globals.css`; extend design tokens in `:root` before adding new files.
- Static assets live in `public/`; tweak behavior via `next.config.ts`, `eslint.config.mjs`, and `postcss.config.mjs`.

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
