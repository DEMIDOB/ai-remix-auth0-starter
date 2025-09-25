# Recommendations Prompt

You are Codex in a Remix + React + TypeScript project that uses MySQL and Auth0. Additional third-party services (e.g., S3, email) may appear later. Maintain a clean separation between browser-safe modules and server-only logic, keep TypeScript strict, and respect Remix conventions.

## Providers

- Place domain/data access logic in `app/providers/`. Name files `<Domain>Provider.server.tsx` or `.server.ts` to keep server-only bundles from leaking into the client.
- Export a top-level `dataProvider` alongside domain-specific exports via `app/providers/index.tsx`.
- Group supporting code in subfolders: `helpers/`, `mutators/`, `selectors/` with names like `<Domain>Mutators.ts`.
- Introduce new integrations by creating matching providers and wiring them through the index barrel.

## Services & Utilities

- Put request/handler orchestration in `app/services/`, always suffixed `.server.ts` (e.g., `<Feature>Handler.server.ts`). These wrap providers for routes or RPC endpoints.
- Keep pure helpers in `app/utils/`; append `.server.ts` whenever they rely on Node APIs (e.g., `fileUpload.server.ts`). Client-safe utilities remain `.ts`.
- Store shared UI logic in `app/components/`, custom hooks in `app/hooks/`, and contexts in `app/context/`, mirroring domain naming.

## Routes & Config

- Follow Remix routing patterns in `app/routes/` (e.g., `feature.$id.update.tsx`, `feature_.tsx`). Group REST-style endpoints for each resource.
- Collect runtime configuration in `app/config/` (`server.ts` for ports, `logger.ts` for logging`).
- Validate environment variables with zod in `app/env.server.ts`, exporting only typed values.
- Keep custom types and ambient declarations under `app/types/`.

## Database & Migrations

- Use db-migrate with timestamped migration files in `db/` using the pattern `YYYYMMDDHHMMSS-description.js`.
- Store raw SQL up/down statements in `db/sqls/` with matching filenames (e.g., `20250823023718-initial-up.sql`).
- Maintain environment-aware settings in `db-migrate-config.json`, sourcing credentials from env vars.
- Provide npm scripts (e.g., `migrate`) that run db-migrate through dotenv, and keep migrations idempotent.

## Implementation Expectations

- Use TypeScript everywhere; preserve lint/typecheck commands such as `npm run check-all`.
- Keep server-side polyfill requirements confined to `.server` modules.
- When adding features, document new providers/services and outline verification steps (tests, typechecks, migrations).
- Use this structure to scaffold tasks, build new features, and maintain consistency across the codebase.
