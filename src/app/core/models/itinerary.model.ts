export interface Itinerary {
  id: string;
  originAirportId: string;
  destinationAirportId: string;
  departureDate: string;
  durationDays: number;
  createdAt: string;
}

/**
 * Payload accepted by the itinerary-service when creating or updating an
 * itinerary. `id` and `createdAt` are assigned by the backend.
 */
export type ItineraryPayload = Omit<Itinerary, 'id' | 'createdAt'>;
