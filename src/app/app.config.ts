import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { graphqlProvider } from './graphql.provider';
import { getLanguage } from './language';

export function getBaseUrl(): string {
  return document.getElementsByTagName('base')[0].href;
}

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/graphql')) {
    const langReq = req.clone({
      setHeaders: {
        'Accept-Language': getLanguage(),
      },
    });

    return next(langReq);
  }
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([languageInterceptor])),
    graphqlProvider,
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json', enforceLoading: true }),
      fallbackLang: 'en',
    }),
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
};
