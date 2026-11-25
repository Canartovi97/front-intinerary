/**
 * Used by the Docker image (`ng build --configuration docker`). The app runs
 * in the user's browser, so the API URLs are the ports the back-end
 * docker-compose publishes on the host — not the container names.
 */
export const environment = {
  production: true,
  airportServiceUrl: 'http://localhost:3001',
  itineraryServiceUrl: 'http://localhost:3000'
};
