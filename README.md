# Blood Link

A blood donation tracking application built with Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, React Query, and English/Bangla translations.

## Requirements

- Node.js 20.9 or newer
- pnpm 12.18 (`corepack enable` if needed)
- The Blood Link Go API (the sibling `blood-link-server` project)

## Local development

```sh
pnpm install
cp .env.example .env
pnpm dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` to create the environment file. Preserve your existing `.env` if you have already configured the API.

Open http://localhost:3000. Set `NEXT_PUBLIC_API_BASE_URL` in `.env` to the backend address (default: `http://localhost:8765`). This public variable is included in the browser bundle at build time; restart development or rebuild production after changing it.

## Production

```sh
pnpm build
pnpm start
```

Deploy with a Next.js-compatible Node.js host. Routing and 404 responses are handled by Next.js; the old Vite SPA fallback is no longer needed.

## Checks

```sh
pnpm typecheck
pnpm lint
pnpm test
```

Vitest uses Vite only as its test runner; the application runs and builds with Next.js.

## Structure

- `src/app`: Next.js routes, root metadata/layout, and client providers.
- `src/views`: Interactive screens used by each route.
- `src/components`: Shared layout, donor, home, and shadcn/ui components.
- `src/api`: Calls to the existing Go backend.
- `src/contexts/AuthContext.tsx`: Browser session restoration and authentication.
- `src/locales`: English and Bangla translations.

Existing routes are `/`, `/login`, `/register`, `/donors`, `/posts`, `/profile`, `/emergency-request`, and `/admin`. Donor filters use URL query parameters such as `/donors?bloodGroup=A%2B&division=Dhaka`.
