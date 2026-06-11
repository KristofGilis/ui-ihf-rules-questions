import { DOCUMENT, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import defaultTranslationsEn from '../../public/i18n/en.json';
import defaultTranslationsFr from '../../public/i18n/fr.json';
import defaultTranslationsNl from '../../public/i18n/nl.json';
import defaultTranslationsSrb from '../../public/i18n/srb.json';

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
  } else if (browserLang?.match(/en|nl|fr/)) {
    browserLanguage = browserLang;
  } else {
    browserLanguage = translateService.getFallbackLang() ?? undefined;
  }

  const localStorageLanguage = localStorage?.getItem('language');

  const language = localStorageLanguage ?? browserLanguage ?? 'en';

  // Set default translations for current language to ensure they're available immediately
  switch (language) {
    case 'en':
      translateService.setTranslation('en', defaultTranslationsEn, true);
      break;
    case 'nl':
      translateService.setTranslation('nl', defaultTranslationsNl, true);
      break;
    case 'srb':
      translateService.setTranslation('srb', defaultTranslationsSrb, true);
      break;
    case 'fr':
      translateService.setTranslation('fr', defaultTranslationsFr, true);
      break;
  }

  return localStorageLanguage ?? browserLanguage ?? 'en';
}
