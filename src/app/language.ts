import { DOCUMENT, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export function getLanguage(): string {
  const translateService = inject(TranslateService);
  const document = inject(DOCUMENT);
  const localStorage = document.defaultView?.localStorage;

  const browserLanguage = translateService.getBrowserLang()?.match(/en|fr|nl/)
    ? translateService.getBrowserLang()
    : translateService.getFallbackLang();
  
  let localStorageLanguage: string | null = null;
  try {
    localStorageLanguage = localStorage?.getItem('language') ?? null;
  } catch (error) {
    // localStorage may fail in private browsing mode
    console.warn('Failed to access localStorage:', error);
  }

  return localStorageLanguage ?? browserLanguage ?? 'en';
}
