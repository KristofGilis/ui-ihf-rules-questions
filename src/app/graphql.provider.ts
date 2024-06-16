import { HttpHeaders } from '@angular/common/http';
import {
  ApplicationConfig,
  InjectionToken,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { relayStylePagination } from '@apollo/client/utilities';
import { TranslateService } from '@ngx-translate/core';
import { APOLLO_FLAGS, APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

const APOLLO_CACHE = new InjectionToken<InMemoryCache>('apollo-cache');
const STATE_KEY = makeStateKey<any>('apollo.state');
const uri = 'https://api-ihf-rules-questions.azurewebsites.net/graphql';

export function apolloOptionsFactory(): ApolloClientOptions<any> {
  const httpLink = inject(HttpLink);
  const translateService = inject(TranslateService);
  const cache = inject(APOLLO_CACHE);
  const transferState = inject(TransferState);
  const isBrowser = transferState.hasKey<any>(STATE_KEY);

  if (isBrowser) {
    const state = transferState.get<any>(STATE_KEY, null);
    cache.restore(state);
  } else {
    transferState.onSerialize(STATE_KEY, () => cache.extract());
    cache.reset();
  }

  return {
    link: httpLink.create({
      uri,
      headers: new HttpHeaders()
        .append('graphql-preflight', '1')
        .append('Accept-Language', translateService.currentLang),
    }),
    cache,
    ssrMode: true,
  };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APOLLO_CACHE,
    useValue: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            rules: relayStylePagination(),
            questions: relayStylePagination(),
          },
        },
        Rule: {
          fields: {
            questions: relayStylePagination(),
          },
        },
      },
    }),
  },
  {
    provide: APOLLO_OPTIONS,
    useFactory: apolloOptionsFactory,
    deps: [TranslateService],
  },
  {
    provide: APOLLO_FLAGS,
    useValue: {
      useInitialLoading: true,
    },
  },
];
