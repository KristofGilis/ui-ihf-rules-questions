import { DOCUMENT, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export function getLanguage(): string {
  const translateService = inject(TranslateService);
  const document = inject(DOCUMENT);
  const localStorage = document.defaultView?.localStorage;

  const browserLang = translateService.getBrowserLang();
  // Map browser language codes to our internal codes
  // 'sr' (Serbian) -> 'srb', standard codes for 'en' and 'nl' remain the same
  let browserLanguage: string | undefined;
  if (browserLang?.startsWith('sr')) {
    browserLanguage = 'srb'; // Serbian (standard code 'sr' -> our 'srb')
  } else if (browserLang?.match(/en|nl/)) {
    browserLanguage = browserLang;
  } else {
    browserLanguage = translateService.getFallbackLang() ?? undefined;
  }

  const localStorageLanguage = localStorage?.getItem('language');

  return localStorageLanguage ?? browserLanguage ?? 'en';
}
