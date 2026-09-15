import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'auth_token';

/**
 * Functional interceptor that attaches a bearer token to outgoing requests
 * when one is present in localStorage.
 *
 * There is no real authentication flow yet (login screen, refresh, etc.) -
 * this is plumbing for a future backlog item. If no token is stored the
 * request passes through unchanged.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return next(req);
  }

  const authorizedReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authorizedReq);
};
