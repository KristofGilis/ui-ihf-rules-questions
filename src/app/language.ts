
import { inject, DOCUMENT } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export function getLanguage(): string {
  const translateService = inject(TranslateService);
  const document = inject(DOCUMENT);
  const localStorage = document.defaultView?.localStorage;

  const browserLanguage = translateService.getBrowserLang()?.match(/en|fr|nl/)
    ? translateService.getBrowserLang()
    : translateService.defaultLang;
  const localStorageLanguage = localStorage?.getItem('language');

  return localStorageLanguage ?? browserLanguage ?? 'en';
}
