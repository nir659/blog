# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS deps

ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM deps AS builder

ENV NODE_ENV=production

COPY . .

RUN pnpm build

FROM node:20-bookworm-slim AS runner

ENV PNPM_HOME="/usr/local/share/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=production \
    PORT=3000

RUN corepack enable

RUN mkdir -p /app /app/posts && chown -R node:node /app

USER node

WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/app/posts ./app/posts

EXPOSE 3000

CMD ["pnpm", "start"]
