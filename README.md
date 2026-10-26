# TDB Booking Frontend

Darshan ticket booking app for a temple board, built with React + TypeScript (strict) on Vite, with an
in-memory mock API that simulates an unreliable network. Built across five problems (P1–P5), each shipped
as its own reviewed pull request.

## Pull requests

| Problem                           | PR                                                                     |
| --------------------------------- | ---------------------------------------------------------------------- |
| P1 – Slot list and booking form   | [#6](https://github.com/alphyemmanuel95/tdb-booking-frontend/pull/6)   |
| P2 – Shareable filters            | [#7](https://github.com/alphyemmanuel95/tdb-booking-frontend/pull/7)   |
| P3 – Safe submit                  | [#8](https://github.com/alphyemmanuel95/tdb-booking-frontend/pull/8)   |
| P4 – My bookings and cancellation | [#9](https://github.com/alphyemmanuel95/tdb-booking-frontend/pull/9)   |
| P5 – Accessibility and Malayalam  | [#10](https://github.com/alphyemmanuel95/tdb-booking-frontend/pull/10) |

**Stack:** Vite 7 · React 19 · React Router 7 · React Hook Form 7 + Zod 4 · Redux Toolkit 2 + RTK Query ·
Tailwind CSS 4 · Vitest 4 + React Testing Library · MSW 2 · Playwright · ESLint 9 · Prettier · npm

## Getting started

Requires Node.js 20.19+ (tested with Node 22.18 / npm 10.9).

```bash
cd frontend
npm ci
npm run dev                  # http://localhost:5173
```

There is no backend. The app uses an in-memory mock API (`frontend/src/api/mockApi.ts`) that behaves
like an unreliable network: every call takes a random 200–1500 ms and fails 20% of the time, half of those after
the change was saved, as if the response was lost (change `DEFAULT_MOCK_API_CONFIG` to adjust). Data is seeded on load (3 temples, slots for the next 7 days, some
full and some already started) and resets on page refresh.

In `npm run dev` only, set the failure rate from the URL: `http://localhost:5173/?failureRate=0` (never fail) or `?failureRate=1` (always fail); add `&lostResponseShare=1` to make every failure happen after the server saved the change (a lost response).

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
frontend/
├── e2e/                 # Playwright specs
└── src/
    ├── app/             # store, typed hooks, routes, layout
    ├── api/             # mock API + seed data, shared RTK Query baseApi, error helpers
    ├── lib/             # IST date/time helpers
    ├── components/      # Button, Input/Textarea, Spinner, ErrorMessage
    ├── features/        # feature folders (API, schema, components, tests)
    ├── hooks/           # shared hooks
    ├── pages/           # route-level pages
    └── test/            # setup, test-utils, test seed, MSW server
```

Endpoints are added per feature with `baseApi.injectEndpoints(...)` and call the mock API through
`queryFn`.

## Testing

- **Vitest + RTL** run in jsdom with `src/test/setup.ts`, which resets the mock API before every test
  with no delay and no random failures. Tests opt in with `configureMockApi({ failureRate: 1 })` or a
  long delay, and use `resetMockApi(createTestSeed())` for predictable data.
- **MSW** has no handlers; it only makes any accidental real HTTP request fail the test.
- **Playwright** smoke tests run against the production build. Run `npm run test:e2e:install` once.

## Troubleshooting

- **`npm error Cannot read properties of null (reading 'edgesOut')`** when _adding_ a package: a bug in
  npm 10.9's dependency resolver triggered by Vitest's peer dependencies. Installing from the lockfile
  (`npm ci` / `npm install`) works. To add a package, use `npx npm@11 install <pkg>` or upgrade npm.
