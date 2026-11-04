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

/** Human-readable labels for the enum values shown in the UI. */
export const LABELS = {
  tripType: { ROUND_TRIP: 'Round trip', ONE_WAY: 'One way' } satisfies Record<TripType, string>,
  cabinClass: {
    ECONOMY: 'Economy',
    PREMIUM_ECONOMY: 'Premium economy',
    BUSINESS: 'Business',
    FIRST: 'First'
  } satisfies Record<CabinClass, string>,
  lodgingType: {
    NONE: 'Not decided yet',
    HOTEL: 'Hotel',
    HOSTEL: 'Hostel',
    APARTMENT: 'Apartment / rental',
    FAMILY_FRIENDS: 'Family or friends',
    OTHER: 'Other'
  } satisfies Record<LodgingType, string>,
  status: {
    PLANNED: 'Planned',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  } satisfies Record<ItineraryStatus, string>,
  documentType: {
    PASSPORT: 'Passport',
    NATIONAL_ID: 'National ID',
    VISA: 'Visa',
    TRAVEL_INSURANCE: 'Travel insurance',
    VACCINATION: 'Vaccination card',
    TICKET: 'Ticket / booking',
    OTHER: 'Other'
  } satisfies Record<DocumentType, string>
};

/** `Object.keys` typed for a label map, preserving its declaration order. */
export function optionsOf<K extends string>(labels: Record<K, string>): K[] {
  return Object.keys(labels) as K[];
}
