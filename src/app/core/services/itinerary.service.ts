import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Itinerary, ItineraryPayload } from '../models/itinerary.model';

/**
 * Talks to the itinerary-service (default: http://localhost:3000).
 * Base URL is configurable per environment via `environment.itineraryServiceUrl`.
 */
@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.itineraryServiceUrl}/itineraries`;

  getAll(): Observable<Itinerary[]> {
    return this.http.get<Itinerary[]>(this.baseUrl);
  }

  getById(id: string): Observable<Itinerary> {
    return this.http.get<Itinerary>(`${this.baseUrl}/${id}`);
  }

  create(itinerary: ItineraryPayload): Observable<Itinerary> {
    return this.http.post<Itinerary>(this.baseUrl, itinerary);
  }

  update(id: string, itinerary: ItineraryPayload): Observable<Itinerary> {
    return this.http.put<Itinerary>(`${this.baseUrl}/${id}`, itinerary);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
