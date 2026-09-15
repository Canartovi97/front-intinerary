import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'airports' },
  {
    path: 'airports',
    loadChildren: () => import('./features/airports/airports.routes').then((m) => m.AIRPORTS_ROUTES)
  },
  {
    path: 'itineraries',
    loadChildren: () =>
      import('./features/itineraries/itineraries.routes').then((m) => m.ITINERARIES_ROUTES)
  },
  { path: '**', redirectTo: 'airports' }
];
