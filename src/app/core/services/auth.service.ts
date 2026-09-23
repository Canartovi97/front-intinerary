import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'auth_token';

interface AuthResponse {
  accessToken: string;
}

interface RegisterResponse {
  id: string;
  email: string;
}

interface DecodedTokenPayload {
  sub: string;
  email: string;
  exp: number;
}

/**
 * Talks to itinerary-service's /auth endpoints and manages the JWT in
 * localStorage under the same key authInterceptor already reads from.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.itineraryServiceUrl}/auth`;

  /** Reactive so the nav bar (and anything else) can react to sign in/out. */
  readonly currentUserEmail = signal<string | null>(this.readEmailFromStoredToken());

  register(email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, { email, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        this.currentUserEmail.set(this.decodeEmail(response.accessToken));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserEmail.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  private readEmailFromStoredToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? this.decodeEmail(token) : null;
  }

  /**
   * Decodes the JWT payload client-side (base64, no signature check — the
   * token is only trusted because the backend issued it and verifies it on
   * every protected request; this is purely for displaying the user's
   * email in the UI).
   */
  private decodeEmail(token: string): string | null {
    try {
      const payloadSegment = token.split('.')[1];
      const payload = JSON.parse(atob(payloadSegment)) as DecodedTokenPayload;
      return payload.email ?? null;
    } catch {
      return null;
    }
  }
}
