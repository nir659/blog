# Minimal Blog

Minimal Blog is a dark, editorial-style landing page for Markdown content. It ships directory-aware navigation, live-rendered posts, and a statically generated archive powered by the Next.js App Router.

![Homepage screenshot](public/screenshots/home.png)

## Features
- Markdown-first publishing flow with nested directories under `app/posts`.
- Interactive reader that streams Markdown over `/api/posts/[...slug]` and renders with GitHub-flavored Markdown.
- Responsive split layout with sticky archive navigation and a customizable hero section.
- Next.js 16 Cache Components enabled for faster builds and partial prerendering support.

## Tech Stack
- Next.js 16 (App Router + Cache Components) with TypeScript.
- React 19 client components for interactive sections.
- Tailwind CSS v4 (via `@tailwindcss/postcss`) for design tokens and utility classes.
- React Markdown + `remark-gfm` for content rendering.

## Getting Started
### Prerequisites
- Node.js 18.18+ or 20.x.
- `pnpm` 9+ (or swap commands with `npm`/`yarn` if you prefer).

### Installation
```bash
pnpm install
```

### Local Development
```bash
pnpm dev
```
Visit `http://localhost:3000` to explore the blog.

### Additional Scripts
- `pnpm build` — create a production bundle.
- `pnpm start` — run the production build locally.
- `pnpm lint` — run the Next.js ESLint ruleset.

## Deployment
1. Ensure environment variables are configured if you add any (none are required by default).
2. Build the project: `pnpm build`.
3. Deploy the `.next` output to your platform of choice:
   - **Vercel**: connect the repository; set the build command to `pnpm build` and output directory to `.next`.
   - **Self-hosted Node**: run `pnpm start` behind your process manager of choice after building.

## Managing Content
- Write posts in Markdown (`.md`) inside `app/posts`. Subdirectories nest neatly into the archive and drive URL slugs.
- Hitting `/api/posts/{path-to-post}` returns the raw Markdown, which the client consumes to render the article.
- Add a file named `welcome.md` to preselect it on load, or the first post will be selected automatically.

## Screenshots
- Homepage preview: `public/screenshots/home.png`
  - Update this file with a fresh capture after visual changes to keep the README accurate.

## Continuous Integration
- GitHub Actions workflow `.github/workflows/ci.yml` installs dependencies with `pnpm`, then runs `pnpm lint` and `pnpm build` on pushes to `main` and `dev` as well as on pull requests.

## Contributing
Contributions are welcome! Start with `CONTRIBUTING.md` for branch strategy, coding conventions, and review expectations. Open a discussion or issue if you want to propose a larger change before diving into a pull request.

## License
Released under the MIT License. See `LICENSE` for details.
