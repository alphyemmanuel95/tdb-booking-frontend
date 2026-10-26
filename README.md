# TDB Booking Frontend

Darshan ticket booking app for a temple board, built with React + TypeScript (strict) on Vite, with an
in-memory mock API that simulates an unreliable network. Built across five problems (P1–P5), each shipped
as its own reviewed pull request.

## Pull requests

| Problem                           | PR    |
| --------------------------------- | ----- |
| P1 – Slot list and booking form   | _TBD_ |
| P2 – Shareable filters            | _TBD_ |
| P3 – Safe submit                  | _TBD_ |
| P4 – My bookings and cancellation | _TBD_ |
| P5 – Accessibility and Malayalam  | _TBD_ |

**Stack:** Vite 7 · React 19 · React Router 7 · React Hook Form 7 + Zod 4 · Redux Toolkit 2 + RTK Query ·
Tailwind CSS 4 · Vitest 4 + React Testing Library · MSW 2 · Playwright · ESLint 9 · Prettier · npm

## Getting started

Requires Node.js 20.19+ (tested with Node 22.18 / npm 10.9).

```bash
cd frontend
npm ci
cp .env.example .env.local   # optional, see "Environment variables"
npm run dev                  # http://localhost:5173
```

There is no backend in this repo. The example page calls `/api/feedback`; in the dev server those
requests fail and the page shows its error state, unless you point `VITE_DEV_PROXY_TARGET` at a backend.

## Scripts (run in `frontend/`)

| Command                    | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Start the Vite dev server                             |
| `npm run build`            | Type-check and build for production into `dist/`      |
| `npm run preview`          | Serve the production build                            |
| `npm run typecheck`        | TypeScript project check (`tsc -b`)                   |
| `npm run lint`             | ESLint (type-aware, React Hooks, jsx-a11y)            |
| `npm run format:check`     | Prettier check (`npm run format` to fix)              |
| `npm test`                 | Run unit and component tests once                     |
| `npm run test:watch`       | Run tests in watch mode                               |
| `npm run test:coverage`    | Tests with V8 coverage (text + `coverage/index.html`) |
| `npm run test:e2e:install` | One-time download of Playwright's Chromium            |
| `npm run test:e2e`         | Build, serve and run Playwright E2E tests             |

## Project structure

```text
.
├── CLAUDE.md            # Instructions for Claude Code
├── SPEC.md              # Current feature plan (generate with /spec)
├── .claude/             # settings.json, skills/, agents/
└── frontend/
    ├── e2e/             # Playwright specs
    └── src/
        ├── app/         # store, typed hooks, routes, layout, env
        ├── api/         # shared RTK Query baseApi, error helpers
        ├── components/  # Button, Input/Textarea, Spinner, ErrorMessage
        ├── features/    # feature folders (API, schema, components, tests)
        ├── hooks/       # shared hooks
        ├── pages/       # route-level pages
        └── test/        # setup, test-utils, MSW handlers and server
```

Add API endpoints per feature with `baseApi.injectEndpoints(...)`. Use local state for component
state; add Redux slices only for client state shared across features.

## Testing

- **Vitest + RTL** run in jsdom with `src/test/setup.ts`. Use `renderWithProviders(ui, { route })` for
  components and `renderApp({ route })` for the full route tree. Both create a fresh Redux store per call,
  so RTK Query caches never leak between tests.
- **MSW** intercepts all HTTP in tests. Default handlers live in `src/test/msw/handlers.ts`;
  override per test with `server.use(feedbackHandlers.empty())` etc. Handlers reset after each test, and
  any unhandled request fails the test, so tests cannot reach a live backend.
- **Playwright** runs against the production build (`vite preview` on port 4173) and mocks the API with
  `page.route`. Run `npm run test:e2e:install` once to download Chromium.

## Environment variables

See `frontend/.env.example`. Only `VITE_*` variables reach the browser bundle, so never put secrets in them.

| Variable                | Default | Purpose                                    |
| ----------------------- | ------- | ------------------------------------------ |
| `VITE_API_BASE_URL`     | `/api`  | Base URL for RTK Query                     |
| `VITE_DEV_PROXY_TARGET` | –       | Dev-only: proxy `/api` to this backend URL |

## Claude Code harness

`CLAUDE.md` holds project rules. `.claude/settings.json` pre-approves read-only checks (tests, lint,
typecheck, build, `git status/diff/log`, `gh … view`), asks before installs, commits, pushes and PR actions,
and denies force-push, `git reset --hard`, `git clean`, `npm publish` and reading `.env` files.
Project `allow` rules take effect after you accept the workspace trust prompt.

| Skill                  | Example                         | Purpose                                                 |
| ---------------------- | ------------------------------- | ------------------------------------------------------- |
| `/spec`                | `/spec Build a task board for…` | Requirements → `SPEC.md` plan, waits for approval       |
| `/start-issue`         | `/start-issue 42`               | Read issue, plan, implement with tests, report          |
| `/verify`              | `/verify`                       | Run all checks, report passed / failed / not run        |
| `/raise-pr`            | `/raise-pr 42 main`             | Check scope and checks, then commit/push/PR on approval |
| `/pr-review`           | `/pr-review 57`                 | Independent review, findings by severity                |
| `/fix-review-comments` | `/fix-review-comments`          | Address unresolved review threads with tests            |

`/start-issue`, `/raise-pr` and `/fix-review-comments` can only be started by you (they are not
auto-invoked).

Subagents in `.claude/agents/` (ask for them by name, e.g. "use the senior-ui-engineer agent to …"):

| Agent                   | Edits files | Purpose                                                                 |
| ----------------------- | ----------- | ----------------------------------------------------------------------- |
| `senior-react-engineer` | yes         | Logic: features, routing, state, RTK Query, forms, hooks, with tests    |
| `senior-ui-engineer`    | yes         | Presentation: components, Tailwind, responsive, WCAG 2.2 AA, with tests |

The two engineer agents enforce strict standards (no `any`/unchecked casts/lint suppressions, required
tests, all checks green before done) and never commit or push.

The GitHub skills need the [GitHub CLI](https://cli.github.com/) authenticated (`gh auth login`) and a
GitHub remote.

## Troubleshooting

- **`npm error Cannot read properties of null (reading 'edgesOut')`** when _adding_ a package: a bug in
  npm 10.9's dependency resolver triggered by Vitest's peer dependencies. Installing from the lockfile
  (`npm ci` / `npm install`) works. To add a package, use `npx npm@11 install <pkg>` or upgrade npm.
