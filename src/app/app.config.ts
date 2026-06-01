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

import { HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { graphqlProvider, restoreApolloCache } from './graphql.provider';
import { getLanguage } from './language';
import { GlobalErrorHandler } from './services/global-error-handler.service';
import { OfflineDataService } from './services/offline-data.service';
import { ScrollRestorationService } from './shared/services/scroll-restoration.service';
import { switchMap } from 'rxjs';

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
    // Restore the persisted Apollo cache before any query runs so that
    // first-paint reads from IndexedDB instead of the network, then kick off
    // the background sync. Chaining them in a single initializer guarantees
    // the cache-emptiness check inside OfflineDataService sees the restored
    // cache rather than firing a full re-prefetch on every refresh.
    provideAppInitializer(() => {
      inject(ScrollRestorationService);
      const offlineData = inject(OfflineDataService);
      return restoreApolloCache().pipe(
        switchMap(() => offlineData.initialize()),
        takeUntilDestroyed()
      );
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideHttpClient(withFetch(), withInterceptors([languageInterceptor])),
    graphqlProvider,
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json', enforceLoading: true }),
      fallbackLang: 'en',
    }),
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
