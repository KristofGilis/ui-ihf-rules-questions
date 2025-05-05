import { HttpHeaders } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  InjectionToken,
  isDevMode,
} from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { relayStylePagination } from '@apollo/client/utilities';
import { Apollo, APOLLO_FLAGS, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

if (isDevMode()) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

const APOLLO_CACHE = new InjectionToken<InMemoryCache>('apollo-cache');
const uri = 'https://api-ihf-rules-questions.azurewebsites.net/graphql';

export function apolloOptionsFactory(): ApolloClientOptions<any> {
  const httpLink = inject(HttpLink);
  const cache = inject(APOLLO_CACHE);

  return {
    link: httpLink.create({
      uri,
      headers: new HttpHeaders().append('graphql-preflight', '1'),
    }),
    cache,
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
            questions: relayStylePagination(['order', 'random']),
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
  },
  {
    provide: APOLLO_FLAGS,
    useValue: {
      useInitialLoading: true,
    },
  },
];
