import { TestBed } from '@angular/core/testing';

import en from './en.json';
import es from './es.json';
import { I18nService } from './i18n.service';

/** Every dotted key path that holds a text, e.g. "nav.signIn". */
function keysOf(node: object, prefix = ''): string[] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === 'string' ? [prefix + key] : keysOf(value as object, `${prefix}${key}.`)
  );
}

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.removeItem('lang');
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  it('has exactly the same keys in es.json and en.json', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(es).sort());
  });

  it('defaults to Spanish', () => {
    expect(service.lang()).toBe('es');
    expect(service.t('nav.signIn')).toBe('Iniciar sesión');
  });

  it('switches language and remembers the choice', () => {
    service.setLang('en');
    TestBed.flushEffects();

    expect(service.t('nav.signIn')).toBe('Sign in');
    expect(localStorage.getItem('lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('fills {{placeholders}} from params', () => {
    expect(service.t('itineraries.list.days', { n: 4 })).toBe('4 d');
    expect(
      service.t('itineraries.form.summary.travelersValue', { adults: 2, children: 1 })
    ).toBe('Adultos: 2 · Niños: 1');
  });

  it('shows the key itself when a text does not exist', () => {
    expect(service.t('does.not.exist')).toBe('does.not.exist');
  });
});
