import { Routes } from '@angular/router';

export const AIRPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./airports-overview/airports-overview.component').then(
        (m) => m.AirportsOverviewComponent
      )
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./airport-detail/airport-detail.component').then(
        (m) => m.AirportDetailComponent
      )
  }
];
