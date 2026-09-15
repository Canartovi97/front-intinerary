import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Airport } from '../models/airport.model';

/**
 * Talks to the airport-service (default: http://localhost:3001).
 * Base URL is configurable per environment via `environment.airportServiceUrl`.
 */
@Injectable({ providedIn: 'root' })
export class AirportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.airportServiceUrl}/airports`;

  getAll(): Observable<Airport[]> {
    return this.http.get<Airport[]>(this.baseUrl);
  }

  getById(id: string): Observable<Airport> {
    return this.http.get<Airport>(`${this.baseUrl}/${id}`);
  }

  create(airport: Omit<Airport, 'id'>): Observable<Airport> {
    return this.http.post<Airport>(this.baseUrl, airport);
  }

  update(id: string, airport: Partial<Airport>): Observable<Airport> {
    return this.http.put<Airport>(`${this.baseUrl}/${id}`, airport);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
