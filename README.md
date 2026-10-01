# front-intinerary

Angular frontend for the distributed itinerary-planning system (graduate architecture course project). This app is a thin client over two independent backend services and does not implement any business logic of its own.

See [docs/architecture.md](docs/architecture.md) for the routing/component diagram
and request-flow sequence diagram. See [.claude/skills/frontend-angular](.claude/skills/frontend-angular/SKILL.md)
for the conventions to follow when implementing a new ticket (Claude Code loads
this automatically when working in this repo).

## Requirements

- Node.js 20/22 (see `package.json` engines)
- npm 10+

## Install

```bash
npm install
```

## Run

```bash
npm start
# or
ng serve
```

The app serves on `http://localhost:4200` by default.

## Backends expected

This frontend talks to two independent services. Their base URLs are configured per environment in `src/environments/`:

| Service            | Default URL             | Config key            |
|---------------------|--------------------------|------------------------|
| itinerary-service    | `http://localhost:3000` | `itineraryServiceUrl` |
| airport-service      | `http://localhost:3001` | `airportServiceUrl`   |

Edit `src/environments/environment.ts` (development) or `src/environments/environment.prod.ts` (production build) to point at different hosts. The app boots and renders friendly empty/error states even if neither backend is running.

## Build

```bash
npm run build
```

Output goes to `dist/front-intinerary`.

## Project structure

```
src/app/
  core/                      Cross-cutting concerns
    guards/                  authGuard - blocks /itineraries when not signed in, redirects to /login
    interceptors/            correlationIdInterceptor (mints x-correlation-id per request, see below),
                              authInterceptor (attaches the stored JWT as a bearer token),
                              authErrorInterceptor (a 401 clears the session and redirects to /login)
    models/                  Airport, Itinerary TypeScript interfaces shared across features
    services/                AirportService, ItineraryService, AuthService (HttpClient wrappers)
  features/
    airports/
      airports-overview/     Landing page for /airports (map + list)
      airport-map/           Leaflet map (OpenStreetMap tiles) of airports
      airport-list/          Table of airports
      airport-detail/        Single airport view (/airports/:id)
      airports.routes.ts     Lazy-loaded route config
    itineraries/
      itinerary-list/        Table of itineraries with edit/delete actions (requires sign-in)
      itinerary-form/        Reactive form used for both create (/itineraries/new)
                              and edit (/itineraries/:id/edit) (requires sign-in)
      itineraries.routes.ts  Lazy-loaded route config, guarded by authGuard
    auth/
      login/                 Sign-in form (/login)
      register/              Account creation form (/register), auto-signs in on success
  shared/
    components/
      nav-bar/               Top nav — Airports/Itineraries links, sign in/out + current user email
      loading-spinner/       Reusable loading / empty / error state indicator
      confirm-dialog/        Reusable confirmation modal (used before deleting an itinerary)
  app.routes.ts               Root route table (redirects "/" to "/airports")
  app.config.ts                provideRouter + provideHttpClient(withInterceptors([
                                  correlationIdInterceptor, authInterceptor, authErrorInterceptor
                                ]))
```

## Authentication

Real login/registration, backed by itinerary-service's `/auth` endpoints:

- `AuthService` (`core/services/auth.service.ts`) calls `POST /auth/register`
  and `POST /auth/login`, storing the returned JWT in `localStorage` under
  `auth_token` — the same key `authInterceptor` already reads to attach
  `Authorization: Bearer <token>` to every request.
- `AuthService.currentUserEmail` is a signal (decoded client-side from the
  JWT payload, no verification — the token is only trusted because the
  backend issued and verifies it) that the nav bar reads to show either
  "Sign in" or the current email + "Sign out".
- `/itineraries` and its children are gated by `authGuard`, since
  itinerary-service now rejects unauthenticated requests there with 401 —
  visiting while signed out redirects straight to `/login` instead of
  loading the page and immediately failing.
- `authErrorInterceptor` catches a 401 from any protected call (e.g. an
  expired token), clears the stale session, and redirects to `/login` —
  except for the `/auth/login` and `/auth/register` calls themselves, so a
  wrong password shows inline on the form instead of bouncing the user.
- The register page auto-signs the user in on success rather than sending
  them back to a separate login step.

Airport browsing stays fully public — no sign-in required for `/airports`.

## Correlation IDs (SCRUM-41)

This app is the true first entry point of every request into the system, so
`correlationIdInterceptor` mints a fresh UUID for every outgoing HTTP call and
attaches it as an `x-correlation-id` header. The backend services (see
back-itinerary's `CorrelationIdMiddleware`) reuse that same ID through their own
structured logs and propagate it further — to each other over HTTP, and into the
`ItineraryCreated` RabbitMQ event's AMQP `correlationId` property — so one ID
traces a single user action across every service's logs, from this app all the
way through the async notification.

## Validation rules mirrored from the backend

The itinerary form enforces, client-side, the same invariants the itinerary-service is expected to enforce:

- origin airport and destination airport must be different
- departure date cannot be in the past
- duration (days) must be greater than 0

## Notable dependencies

- `angular-plotly.js` + `plotly.js-dist-min` for the airport map (geo scatter plot)
- Angular Reactive Forms for itinerary create/edit
