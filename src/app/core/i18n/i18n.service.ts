import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import en from './en.json';
import es from './es.json';

export type Lang = 'es' | 'en';

/** The shape every language file must have — `es.json` is the reference. */
export type Dictionary = typeof es;

/**
 * Both dictionaries are bundled, so switching language is instant and works
 * offline. Typing `en` as `Dictionary` makes the build fail if en.json is
 * missing a key (or a whole section) that es.json has.
 */
const DICTIONARIES: Record<Lang, Dictionary> = { es, en: en satisfies Dictionary };

export const LANGS: readonly Lang[] = ['es', 'en'];
const DEFAULT_LANG: Lang = 'es';
const STORAGE_KEY = 'lang';

/**
 * Minimal runtime i18n: the current language lives in a signal, texts are
 * looked up by dotted key ("itineraries.form.title") and `{{name}}`
 * placeholders are filled from params. Spanish is the default; the choice
 * is remembered per browser.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);

  readonly lang = signal<Lang>(readStoredLang());

  /** Locale id for Angular's date/number pipes. */
  readonly locale = computed(() => (this.lang() === 'es' ? 'es' : 'en-US'));

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.document.documentElement.lang = lang;
      this.document.title = this.t('app.title');
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Storage can be unavailable (private mode); the choice just isn't remembered.
      }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /**
   * Text for `key` in the current language, falling back to Spanish and then
   * to the key itself, so a missing text is visible instead of blank.
   */
  t(key: string, params?: Record<string, string | number>): string {
    const text = lookup(DICTIONARIES[this.lang()], key) ?? lookup(DICTIONARIES.es, key) ?? key;
    return params ? text.replace(/\{\{(\w+)\}\}/g, (match, name) => String(params[name] ?? match)) : text;
  }
}

function lookup(dictionary: Dictionary, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dictionary);
  return typeof value === 'string' ? value : undefined;
}

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(stored as Lang) ? (stored as Lang) : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}
