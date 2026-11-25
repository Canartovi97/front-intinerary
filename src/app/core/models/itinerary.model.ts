export type TripType = 'ROUND_TRIP' | 'ONE_WAY';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type LodgingType = 'NONE' | 'HOTEL' | 'HOSTEL' | 'APARTMENT' | 'FAMILY_FRIENDS' | 'OTHER';
export type Currency = 'COP' | 'USD' | 'EUR';
export type ItineraryStatus = 'PLANNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type DocumentType =
  | 'PASSPORT'
  | 'NATIONAL_ID'
  | 'VISA'
  | 'TRAVEL_INSURANCE'
  | 'VACCINATION'
  | 'TICKET'
  | 'OTHER';

export interface Travelers {
  adults: number;
  children: number;
  cabinClass: CabinClass;
}

export interface Lodging {
  type: LodgingType;
  name: string | null;
  address: string | null;
}

export interface Budget {
  amount: number | null;
  currency: Currency;
}

export interface TourGuide {
  name: string;
  phone: string | null;
  email: string | null;
  language: string | null;
  notes: string | null;
}

export interface EmergencyContact {
  name: string;
  relationship: string | null;
  phone: string;
}

export interface TravelDocument {
  type: DocumentType;
  reference: string | null;
  /** YYYY-MM-DD */
  expiresOn: string | null;
  notes: string | null;
}

export interface PlannedAttraction {
  attractionId: number;
  name: string;
  city: string;
}

/** The optional trip-planning sections of an itinerary. */
export interface ItineraryDetails {
  tripType: TripType;
  travelers: Travelers;
  lodging: Lodging;
  budget: Budget;
  status: ItineraryStatus;
  notes: string | null;
  guides: TourGuide[];
  emergencyContacts: EmergencyContact[];
  documents: TravelDocument[];
  attractions: PlannedAttraction[];
}

export interface Itinerary extends ItineraryDetails {
  id: string;
  name: string;
  /** Owner: the user that created it (assigned by the backend from the JWT). */
  userId: string;
  originAirportId: string;
  destinationAirportId: string;
  departureDate: string;
  durationDays: number;
  /** departureDate + durationDays for a round trip, null for one way. */
  returnDate: string | null;
  /** Documents that expire before the trip ends (computed by the backend). */
  documentsExpiringDuringTrip: TravelDocument[];
  createdAt: string;
}

/**
 * Payload accepted by the itinerary-service when creating or updating an
 * itinerary. `id`, `userId`, `createdAt` and the computed fields are
 * assigned by the backend.
 */
export type ItineraryPayload = Omit<
  Itinerary,
  'id' | 'userId' | 'createdAt' | 'returnDate' | 'documentsExpiringDuringTrip'
>;

/** Options in display order; their texts live in the i18n files under itineraries.labels.*. */
export const TRIP_TYPES: readonly TripType[] = ['ROUND_TRIP', 'ONE_WAY'];
export const CABIN_CLASSES: readonly CabinClass[] = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
export const LODGING_TYPES: readonly LodgingType[] = [
  'NONE',
  'HOTEL',
  'HOSTEL',
  'APARTMENT',
  'FAMILY_FRIENDS',
  'OTHER'
];
export const CURRENCIES: readonly Currency[] = ['COP', 'USD', 'EUR'];
export const ITINERARY_STATUSES: readonly ItineraryStatus[] = [
  'PLANNED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED'
];
export const DOCUMENT_TYPES: readonly DocumentType[] = [
  'PASSPORT',
  'NATIONAL_ID',
  'VISA',
  'TRAVEL_INSURANCE',
  'VACCINATION',
  'TICKET',
  'OTHER'
];
