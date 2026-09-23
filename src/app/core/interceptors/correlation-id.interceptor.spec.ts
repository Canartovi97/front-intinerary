import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { CORRELATION_ID_HEADER, correlationIdInterceptor } from './correlation-id.interceptor';

describe('correlationIdInterceptor', () => {
  it('attaches a correlation id header to the outgoing request', () => {
    const req = new HttpRequest('GET', '/airports');
    const next = jasmine.createSpy('next').and.returnValue(of());

    correlationIdInterceptor(req, next);

    expect(next).toHaveBeenCalledTimes(1);
    const forwardedReq: HttpRequest<unknown> = next.calls.mostRecent().args[0];
    expect(forwardedReq.headers.has(CORRELATION_ID_HEADER)).toBe(true);
    expect(forwardedReq.headers.get(CORRELATION_ID_HEADER)).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('mints a different id for each request', () => {
    const req = new HttpRequest('GET', '/airports');
    const next = jasmine.createSpy('next').and.returnValue(of());

    correlationIdInterceptor(req, next);
    correlationIdInterceptor(req, next);

    const [firstReq, secondReq]: HttpRequest<unknown>[] = next.calls.allArgs().map((args) => args[0]);
    expect(firstReq.headers.get(CORRELATION_ID_HEADER)).not.toEqual(
      secondReq.headers.get(CORRELATION_ID_HEADER)
    );
  });
});
