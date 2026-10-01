import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authErrorInterceptor } from './auth-error.interceptor';

describe('authErrorInterceptor', () => {
  function setup(authServiceStub: Partial<AuthService> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: jasmine.createSpy('logout'), ...authServiceStub } }
      ]
    });
    return {
      authService: TestBed.inject(AuthService),
      router: TestBed.inject(Router)
    };
  }

  it('logs out and redirects to /login on a 401 from a protected endpoint', (done) => {
    const { authService, router } = setup();
    spyOn(router, 'navigateByUrl');
    const req = new HttpRequest('GET', '/itineraries');
    const next = () =>
      throwError(() => new HttpErrorResponse({ status: 401, url: '/itineraries' }));

    TestBed.runInInjectionContext(() => authErrorInterceptor(req, next)).subscribe({
      error: () => {
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
        done();
      }
    });
  });

  it('does not log out on a 401 from the login endpoint itself', (done) => {
    const { authService, router } = setup();
    spyOn(router, 'navigateByUrl');
    const req = new HttpRequest('POST', '/auth/login', {});
    const next = () => throwError(() => new HttpErrorResponse({ status: 401, url: '/auth/login' }));

    TestBed.runInInjectionContext(() => authErrorInterceptor(req, next)).subscribe({
      error: () => {
        expect(authService.logout).not.toHaveBeenCalled();
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('passes through non-401 errors untouched', (done) => {
    const { authService } = setup();
    const req = new HttpRequest('GET', '/itineraries');
    const next = () =>
      throwError(() => new HttpErrorResponse({ status: 500, url: '/itineraries' }));

    TestBed.runInInjectionContext(() => authErrorInterceptor(req, next)).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
        expect(authService.logout).not.toHaveBeenCalled();
        done();
      }
    });
  });
});
