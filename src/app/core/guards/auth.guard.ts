import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Itineraries are personal data (mirrors itinerary-service's JwtAuthGuard,
 * which now rejects unauthenticated requests to /itineraries with 401).
 * Redirects to /login instead of letting the page load and immediately
 * fail with an error state.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
