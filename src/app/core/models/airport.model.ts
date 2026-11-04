export interface Airport {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

/**
 * A handful of airports come back from api-colombia with no coordinates at
 * all; the backend adapter defaults those to (0, 0), in the Gulf of Guinea.
 */
export function hasCoordinates(airport: Airport): boolean {
  return airport.latitude !== 0 || airport.longitude !== 0;
}

/** A tourist attraction around an airport's destination (from Airport Service). */
export interface TouristAttraction {
  id: number;
  name: string;
  description: string;
  city: string;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}
