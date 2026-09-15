---
name: frontend-angular
description: Conventions for adding features to the front-intinerary Angular app — standalone components, feature routing, core services/interceptors, reactive form validators, and how the app relates to the backend and upcoming backlog tickets. Use whenever implementing, reviewing, or planning a frontend ticket in this repo.
---

# Frontend conventions (front-intinerary)

Angular 19, standalone components only (no NgModules beyond what the CLI
needs), lazy-loaded feature routes. This app must **only** call the internal
backend services (`airport-service`, `itinerary-service`) — never
`api-colombia.com` directly (SCRUM-14's "Frontend consume solo servicios
internos"). See [docs/architecture.md](../../docs/architecture.md) for the
request-flow diagram.

## Repo map

```
src/
  environments/
    environment.ts          airportServiceUrl (default :3001), itineraryServiceUrl (:3000)
    environment.prod.ts     prod placeholders
  app/
    core/
      interceptors/          authInterceptor (functional, reads localStorage token — plumbing only)
      models/                Airport, Itinerary interfaces mirroring backend domain shapes
      services/              AirportService, ItineraryService (HttpClient, one per backend service)
    features/
      airports/              map (Plotly) + list + detail, lazy-loaded at /airports
      itineraries/            list + reactive-form create/edit, lazy-loaded at /itineraries
    shared/
      components/            nav-bar, loading-spinner, confirm-dialog — reusable, no feature logic
    app.routes.ts             top-level route table, delegates to each feature's *.routes.ts
    app.config.ts             provideHttpClient(withInterceptors([authInterceptor])), provideRouter
```

## Adding a feature (the repeatable recipe)

1. **Model** — if the backend domain shape doesn't already exist under
   `core/models/`, add an interface there matching the backend entity exactly
   (field names, not just types) and export it from `core/models/index.ts`.
2. **Service** — one `@Injectable({ providedIn: 'root' })` service per backend
   service under `core/services/`, `inject(HttpClient)`, base URL built from
   `environment.<x>ServiceUrl`. Don't call `HttpClient` directly from a
   component — always go through a `core/services/*` service (see
   `AirportService`/`ItineraryService` for the CRUD-method shape to copy).
3. **Feature folder** — under `features/<feature>/`, one folder per component
   (`<name>.component.ts/.html/.scss`), a `<feature>.routes.ts` exporting a
   `Routes` array, referenced from `app.routes.ts` via `loadChildren`. Standalone
   components import what they need directly (`imports: [...]` in
   `@Component`) — no shared feature module.
4. **Business validation mirrored client-side** — if the backend enforces a
   domain rule (see the backend's `itinerary.entity.ts` — origin≠destination,
   no past dates, positive duration), add a matching Angular validator in
   `<feature>/<form>.validators.ts` (see `itinerary-form.validators.ts` for the
   pattern: one `ValidatorFn` per rule, group-level validators for
   cross-field rules like origin/destination). Client-side validation is a UX
   nicety — the backend is still the source of truth and must reject invalid
   data even if the frontend has a bug.
5. **Graceful degradation** — every component that calls a backend service
   must render a sane state when that call fails (backend down, network
   error) instead of crashing. Follow `airport-map`/`airport-list`'s pattern:
   catch the error in the component, show `shared/components/loading-spinner`
   or an inline "couldn't reach the service" message.

## Auth plumbing (not yet real)

`authInterceptor` in `core/interceptors/` already attaches
`Authorization: Bearer <token>` from `localStorage` if present, and is wired
into `app.config.ts`. When SCRUM's JWT ticket lands, the login flow only needs
to write the token to that same `localStorage` key — don't re-wire the
interceptor.

## Before committing any ticket

1. `npm run build` (or `ng build`) — must succeed with no errors, and check the
   bundle budget isn't blown (Plotly must stay in its own lazy chunk — see how
   `airport-map.component.ts` assigns `PlotlyModule.plotlyjs` locally rather
   than in `main.ts`, if you touch that component).
2. `ng serve` and manually click through the affected route with the backend
   either running or stopped, to confirm both the happy path and the
   graceful-degradation path.
3. Branch `feature/SCRUM-XX-short-slug` off `main`, one commit per ticket
   referencing the Jira ID, PR back into `main`.

## Picking the next ticket

Check `docs/architecture.md`'s dependency notes before scoping a ticket — the
airports feature (map + list + detail) and the itineraries CRUD feature are
both already scaffolded end-to-end against mock/real backend calls; most
remaining frontend tickets are about hardening what exists (loading states,
validation edge cases, auth wiring) rather than net-new screens.
