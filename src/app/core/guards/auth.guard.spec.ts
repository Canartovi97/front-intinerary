import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function runGuard(isLoggedIn: boolean) {
    const authServiceStub = { isLoggedIn: () => isLoggedIn };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceStub }]
    });

    return TestBed.runInInjectionContext(() =>
      authGuard(null as never, { url: '/itineraries' } as never)
    );
  }

  it('allows navigation when the user is logged in', () => {
    expect(runGuard(true)).toBe(true);
  });

  it('redirects to /login when the user is not logged in', () => {
    const result = runGuard(false);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
