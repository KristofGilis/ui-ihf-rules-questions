import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { provideRouter } from '@angular/router';

import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { switchMap } from 'rxjs';
import { routes } from './app.routes';
import { graphqlProvider, restoreApolloCache } from './graphql.provider';
import { getLanguage } from './language';
import { GlobalErrorHandler } from './services/global-error-handler.service';
import { OfflineDataService } from './services/offline-data.service';
import { ScrollRestorationService } from './shared/services/scroll-restoration.service';

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
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // Kick off cache restore + background sync, but do NOT block bootstrap on
    // them. Blocking here adds hundreds of ms to FCP/LCP (Lighthouse "element
    // render delay"). Apollo's default `cache-first` policy means in-flight
    // queries will fall back to the network for a few hundred ms after first
    // load until restore completes, which is an acceptable trade-off for a
    // much faster initial paint. Subsequent loads still benefit from the
    // persisted IndexedDB cache as soon as restore finishes.
    provideAppInitializer(() => {
      inject(ScrollRestorationService);
      const offlineData = inject(OfflineDataService);
      restoreApolloCache()
        .pipe(
          switchMap(() => offlineData.initialize()),
          takeUntilDestroyed()
        )
        .subscribe();
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideHttpClient(withInterceptors([languageInterceptor])),
    graphqlProvider,
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      fallbackLang: 'en',
    }),
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
