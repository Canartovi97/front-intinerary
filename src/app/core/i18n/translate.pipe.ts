import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from './i18n.service';

/**
 * `{{ 'nav.signIn' | t }}` or `{{ 'itineraries.list.count' | t: { n: 3 } }}`.
 * Impure so every view updates as soon as the language changes.
 */
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
