# Architecture diagrams

Reference diagrams for the frontend. See the [frontend-angular skill](../.claude/skills/frontend-angular/SKILL.md)
for the conventions these diagrams describe, and the backend repo's
`docs/architecture.md` for the full system view (services, database, broker).

## App structure / routing

```mermaid
graph TB
    Root["/ (redirect)"] --> Airports["/airports"]
    Root --> Itineraries["/itineraries"]

    subgraph AirportsFeature["features/airports (lazy)"]
        Airports --> AirportsOverview[AirportsOverviewComponent<br/>map + list]
        AirportsOverview --> AirportMap[AirportMapComponent<br/>Plotly geo scatter]
        AirportsOverview --> AirportList[AirportListComponent]
        AirportDetailRoute["/airports/:id"] --> AirportDetail[AirportDetailComponent]
    end

    subgraph ItinerariesFeature["features/itineraries (lazy)"]
        Itineraries --> ItineraryList[ItineraryListComponent]
        ItinerariesNew["/itineraries/new"] --> ItineraryForm[ItineraryFormComponent]
        ItinerariesEdit["/itineraries/:id/edit"] --> ItineraryForm
    end

    ItineraryList -.uses.-> ConfirmDialog[shared/ConfirmDialogComponent]

    style AirportsFeature fill:#4a90d9,color:#fff
    style ItinerariesFeature fill:#4a90d9,color:#fff
```

## Request flow

```mermaid
sequenceDiagram
    participant C as Component
    participant S as core/services (AirportService / ItineraryService)
    participant I as authInterceptor
    participant AS as Airport Service :3001
    participant IS as Itinerary Service :3000

    C->>S: getAll() / create() / update() / delete()
    S->>I: HttpClient request
    I->>I: attach Authorization header if token in localStorage
    alt airports data
        I->>AS: HTTP request
        AS-->>I: response or error
    else itinerary data
        I->>IS: HTTP request
        IS-->>I: response or error
    end
    I-->>S: response or error
    S-->>C: Observable
    C->>C: render data, or graceful error/empty state on failure
```

**Rule enforced by this diagram:** the frontend never has a direct edge to
`api-colombia.com` — all airport data flows through Airport Service.

## Ticket sequencing note

Both feature areas (`airports`, `itineraries`) already have working
components, routes, and services against the real backend contracts. When
picking up a frontend ticket, check whether it's asking for a **new** screen
or hardening an **existing** one (validation edge case, loading/error state,
auth) — most of the remaining backlog for the frontend is the latter.
