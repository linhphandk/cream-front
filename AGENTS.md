# AGENTS.md

Mirrors the conventions of the sibling repo `noshi-front` (same stack, deps, and tooling config).

## Behavior

- Always use caveman mode (bone intensity). No filler, no hedging, fragments OK.
- Always open a pull request instead of committing directly to main.
- Always check what needs to be done and give a summary before starting work. Never start coding immediately.

## Stack

- React 19 + TypeScript 5 + Vite 6
- `@radix-ui/themes` (UI library) — NOT shadcn, MUI, or Chakra
- React Router v7 (routing) + react-query 5 (server state) + react-hook-form 7 (forms)
- Tailwind CSS v4 (`@tailwindcss/vite`, no `tailwind.config.js`)
- Vitest + React Testing Library (unit); Playwright (e2e)
- Prettier (formatting) + ESLint (linting)

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server on :5173; proxies `/auth`, `/orgs`, `/onboarding/stripe`, `/health` to `VITE_API_URL` (default `http://localhost:3000`, cream-back) |
| `npm run build` | `tsc -b && vite build` — also the **real** typecheck |
| `npm run lint` | `eslint .` (flat config) |
| `npm run format` / `format:check` | Prettier write / check. NOT gated by pre-commit or CI |
| `npm test` | Vitest run (jsdom, globals on). Single file: `npx vitest run src/path.test.ts` |
| `npm run e2e` | Playwright (auto-starts `npm run dev` on :5173) |
| `npm run api:generate` | Runs orval only — spec is hand-maintained at `api/openapi.json` |

## Critical gotchas

- **cream-back has no CORS layer and no OpenAPI endpoint.** In dev, leave `VITE_API_URL` unset so requests stay same-origin through the Vite proxy. The proxy, not CORS, makes auth cookies (`refresh_token`, `Path=/auth`) work.
- **`api/openapi.json` is hand-maintained.** It must exactly match cream-back's serde shapes (note: `Organization` serializes camelCase, everything else snake_case). Regenerate the client after backend changes: `npm run api:generate`. Once cream-back serves an OpenAPI endpoint, switch to curl + orval like noshi does.
- **`npm run typecheck` is a no-op.** Use `npm run build` for real type checking.
- **Test files are excluded from `tsc -b`**; test type errors surface via Vitest.
- **Pre-commit is heavy:** `.husky/pre-commit` runs `lint && test && build && e2e` (boots a dev server for Playwright).
- **`verbatimModuleSyntax: true`** → `import type` for type-only imports.
- **`erasableSyntaxOnly: true`** → no enums, namespaces, or constructor parameter properties.
- **`noUnusedLocals` / `noUnusedParameters`** → prefix intentionally unused params with `_`.
- **Prettier differs from defaults:** `semi: false`, `singleQuote: false`, `trailingComma: "all"`, `printWidth: 100`.
- orval hooks default `TError = void` — pass an explicit error type when rendering `error` in JSX (see `DonatePage`).

## Architecture

- SPA entrypoint: `src/main.tsx` → `index.html`. Path alias `@` → `src/` (vite, vitest, tsconfig).
- Orval codegen: `src/api/generated.ts` (do not edit manually) using fetch wrapper `src/api/custom-fetch.ts` (adds Bearer token, auto-refreshes on 401). Config key in `orval.config.ts` is `cream`.
- Auth: access token in memory + localStorage (`src/utils/token.ts`), refresh via HttpOnly cookie handled by `src/api/auth-interceptor.ts`. `AuthContext` stores user. Org comes from `GET /orgs/mine` (react-query) — nothing org-related is cached locally.
- Only runtime env var: `VITE_API_URL` (see `.env.example`). Node 22; npm is the package manager (lockfile committed).

## Routes

- `/login`, `/signup` — public auth (register/login/logout/refresh endpoints)
- `/onboarding` (protected) — create org + start Stripe Connect onboarding (`POST /orgs`, `POST /onboarding/stripe/create`)
- `/onboarding/success`, `/onboarding/error` — Stripe return targets; poll `GET /onboarding/stripe/status/{org_id}`, resume via `POST /onboarding/stripe/refresh/{org_id}`
- `/dashboard` (protected) — org summary + logout
- `/donate/:subdomain` — public donation page (`GET /orgs/{subdomain}`, `POST /orgs/{subdomain}/donate`, `GET .../donate/{donation_id}`); blocked while `stripeOnboardingComplete` is false

SPA donate route is `/donate/:subdomain` (not `/orgs/...`) to avoid clashing with the API proxy prefix `/orgs`.

## Import convention

- Use `@/` alias: `import { useAuth } from "@/context"` not relative `../../`.
- Barrel exports via `index.ts` in each module directory.
- Types imported from `@/types`.

## File naming

- Pages: `PascalCasePage.tsx` (e.g., `LoginPage.tsx`)
- Components: `PascalCase/index.tsx`
- Hooks: `camelCase.ts`
- Tests: `PascalCase.test.tsx` co-located or `__tests__/`

## Component style

- `const ComponentName = () => { ... }` + `export default ComponentName`; never `export default function`
- Radix UI components as primary building blocks; Tailwind utilities for layout; Radix CSS vars for color
- App wrapped in Radix `<Theme>` (set in `src/main.tsx`)

## Testing

- jsdom, globals on. Setup: `src/test/setup.ts`. Use `user-event`, not `fireEvent`.
- All new features MUST include tests.

## Do NOT

- Install shadcn, MUI, Chakra, or any component library besides Radix Themes.
- Read or search `node_modules`.
- Add comments unless explicitly asked.
- Use `any` — prefer `unknown` or proper types.
- Access `localStorage` directly (route through `src/utils/token.ts`).
- Make raw `fetch` calls outside `src/api/custom-fetch.ts` / `src/api/auth-interceptor.ts`.
