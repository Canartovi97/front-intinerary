import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ITINERARIES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./itinerary-list/itinerary-list.component').then((m) => m.ItineraryListComponent)
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./itinerary-form/itinerary-form.component').then((m) => m.ItineraryFormComponent)
  },
  {
    path: ':id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./itinerary-form/itinerary-form.component').then((m) => m.ItineraryFormComponent)
  }
];
