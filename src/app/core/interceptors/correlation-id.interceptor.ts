import { HttpInterceptorFn } from '@angular/common/http';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * This app is the true first entry point of every request into the system
 * (SCRUM-41: "el correlation ID se genera en el primer punto de entrada").
 * Mints one UUID per outgoing HTTP call and attaches it as a header so the
 * backend services can propagate the same ID through their own logs and
 * downstream calls/events — see back-itinerary's CorrelationIdMiddleware.
 */
export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = crypto.randomUUID();

  const tracedReq = req.clone({
    setHeaders: { [CORRELATION_ID_HEADER]: correlationId }
  });

  return next(tracedReq);
};
