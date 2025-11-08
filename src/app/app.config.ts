import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import * as Sentry from '@sentry/angular';

import { HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { graphqlProvider } from './graphql.provider';
import { getLanguage } from './language';
import { GlobalErrorHandler } from './services/global-error-handler.service';
import { ScrollRestorationService } from './shared/services/scroll-restoration.service';

// Initialize Sentry
if (environment.sentry.enabled && environment.sentry.dsn) {
  Sentry.init({
    dsn: environment.sentry.dsn,
    environment: environment.sentry.environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
    enableLogs: true,
    tracesSampleRate: environment.sentry.tracesSampleRate,
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    beforeSend(event) {
      // Don't send events in development
      if (!environment.production) {
        return null;
      }
      return event;
    },
  });
}

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
    provideAppInitializer(() => {
      inject(ScrollRestorationService);
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
    {
      provide: ErrorHandler,
      useFactory: () => {
        return environment.sentry.enabled ? Sentry.createErrorHandler({ showDialog: false }) : new GlobalErrorHandler();
      },
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    provideAppInitializer(() => {
      if (environment.sentry.enabled) {
        inject(Sentry.TraceService);
      }
    }),
  ],
};
