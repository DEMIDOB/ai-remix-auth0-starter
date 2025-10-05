# Recommendations Prompt

You are Codex in a Remix + React + TypeScript project that currently ships as an Auth0 login starter. There is no data layer yet—introduce one only when you need it, keeping server-only modules suffixed with `.server.ts` so Remix can tree-shake correctly.

## Auth & Sessions

- Use `requireAuth` in route loaders to gate protected pages.
- Store only the fields you need from Auth0 in the session; extend the `User` type inside `app/services/auth.server.ts` when you add more data.
- Logout flows should destroy the session and redirect through Auth0’s logout endpoint.

## Providers & Services

- When you add data sources, place provider modules under `app/providers/` (e.g., `MyFeatureProvider.server.ts`) and keep them server-only.
- Wrap provider calls with orchestration logic in `app/services/` to keep routes thin. Prefer names like `<Feature>.server.ts` or `<Feature>Service.server.ts`.
- Keep pure utilities in `app/utils/` (no `.server` suffix) so they are safe to run in both environments.

## Routes & UI

- Follow Remix routing conventions in `app/routes/`. Co-locate CSS or shared UI in `app/styles/` and `app/components/`.
- Tailwind is available globally via `app/styles/tailwind.css`; add new component classes under the `@layer components` section when it saves repetition.
- Keep React components small and compose them—lift state to loaders/actions instead of client-only effects when possible.

## Implementation Expectations

- Stick with TypeScript everywhere and keep strict type checking enabled.
- Validate environment variables close to where they are consumed or introduce a typed env helper if the configuration surface grows.
- Document notable changes (new routes, providers, background jobs) so teammates know how to test them.
