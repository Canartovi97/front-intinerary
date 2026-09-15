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
    interceptors/            authInterceptor - attaches a bearer token from localStorage (plumbing for future auth)
    models/                  Airport, Itinerary TypeScript interfaces shared across features
    services/                AirportService, ItineraryService (HttpClient wrappers)
  features/
    airports/
      airports-overview/     Landing page for /airports (map + list)
      airport-map/           Plotly geo scatter plot of airports
      airport-list/          Table of airports
      airport-detail/        Single airport view (/airports/:id)
      airports.routes.ts     Lazy-loaded route config
    itineraries/
      itinerary-list/        Table of itineraries with edit/delete actions
      itinerary-form/        Reactive form used for both create (/itineraries/new)
                              and edit (/itineraries/:id/edit)
      itineraries.routes.ts  Lazy-loaded route config
  shared/
    components/
      nav-bar/               Top navigation linking to Airports / Itineraries
      loading-spinner/       Reusable loading / empty / error state indicator
      confirm-dialog/        Reusable confirmation modal (used before deleting an itinerary)
  app.routes.ts               Root route table (redirects "/" to "/airports")
  app.config.ts                provideRouter + provideHttpClient(withInterceptors([authInterceptor]))
```

## Validation rules mirrored from the backend

The itinerary form enforces, client-side, the same invariants the itinerary-service is expected to enforce:

- origin airport and destination airport must be different
- departure date cannot be in the past
- duration (days) must be greater than 0

## Notable dependencies

- `angular-plotly.js` + `plotly.js-dist-min` for the airport map (geo scatter plot)
- Angular Reactive Forms for itinerary create/edit
