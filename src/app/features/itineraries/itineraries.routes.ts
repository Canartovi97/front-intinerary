import { Routes } from '@angular/router';

export const ITINERARIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./itinerary-list/itinerary-list.component').then((m) => m.ItineraryListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./itinerary-form/itinerary-form.component').then((m) => m.ItineraryFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./itinerary-form/itinerary-form.component').then((m) => m.ItineraryFormComponent)
  }
];
