import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/** Builds a minimal (unsigned) JWT with the given payload, base64url-encoded like a real token. */
function fakeJwt(payload: object): string {
  const base64url = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${base64url({ alg: 'none' })}.${base64url(payload)}.`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts logged out when there is no stored token', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUserEmail()).toBeNull();
  });

  it('stores the token and decodes the email on successful login', () => {
    const token = fakeJwt({ sub: 'user-1', email: 'jane@example.com', exp: 9999999999 });

    service.login('jane@example.com', 'secret').subscribe();

    const req = httpMock.expectOne(`${environment.itineraryServiceUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: token });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUserEmail()).toBe('jane@example.com');
    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('clears the token and email on logout', () => {
    localStorage.setItem('auth_token', fakeJwt({ sub: 'x', email: 'a@b.com' }));

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('posts to /auth/register with the given credentials', () => {
    service.register('new@example.com', 'password123').subscribe();

    const req = httpMock.expectOne(`${environment.itineraryServiceUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'new@example.com', password: 'password123' });
    req.flush({ id: 'u1', email: 'new@example.com' });
  });
});
