# Eat While Pregnant (Bun Fullstack)

Single Bun server that serves both the API and React web app. Redis is the primary data store.

## Why this shape

- One runtime and one deployment unit
- Redis-backed food records with a 30-day TTL
- Optional Anthropic enrichment for refreshes

## Run locally

1. Start Redis from the repo root:

```sh
docker compose up -d redis
```

2. Install dependencies:

```sh
cd web
bun install
```

3. Run hot dev server:

```sh
bun run dev
```

App defaults to `http://localhost:3000`.

## Environment

Copy `web/.env.example` to `web/.env`.

- `REDIS_URL` is required.
- `FOOD_TTL_SECONDS` defaults to 30 days (`2592000`).
- `ANTHROPIC_API_KEY` is optional. If missing, fallback guidance is returned and still cached.
- `ADMIN_API_KEY` protects admin endpoints and `/admin` tools.

## Admin tools

- Open `/admin` in the browser.
- Provide `ADMIN_API_KEY` to load feedback index and feedback rows.
- Use "Force refresh selected food" to regenerate the cached food entry immediately.

## Railway wiring

For Railway, configure these environment variables on the service:

- `PORT` (Railway usually injects this)
- `REDIS_URL` (from Railway Redis service)
- `FOOD_TTL_SECONDS` (optional, default `2592000`)
- `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` (optional)
- `ADMIN_API_KEY` (required for admin APIs)

## Scripts

- `bun run dev` - Bun hot server
- `bun run build` - Build web HTML bundle and server bundle to `dist/`
- `bun run start` - Start production server
- `bun run typecheck` - TypeScript checks
