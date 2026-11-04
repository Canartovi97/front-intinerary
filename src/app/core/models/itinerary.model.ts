export interface Itinerary {
  id: string;
  name: string;
  /** Owner: the user that created it (assigned by the backend from the JWT). */
  userId: string;
  originAirportId: string;
  destinationAirportId: string;
  departureDate: string;
  durationDays: number;
  createdAt: string;
}

/**
 * Payload accepted by the itinerary-service when creating or updating an
 * itinerary. `id`, `userId` and `createdAt` are assigned by the backend.
 */
export type ItineraryPayload = Omit<Itinerary, 'id' | 'userId' | 'createdAt'>;
