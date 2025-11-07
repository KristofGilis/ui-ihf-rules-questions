import { HttpHeaders } from '@angular/common/http';
import { ApplicationConfig, inject, InjectionToken } from '@angular/core';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';
import { Apollo, APOLLO_FLAGS, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

const APOLLO_CACHE = new InjectionToken<InMemoryCache>('apollo-cache');
const uri = 'https://api-ihf-rules-questions.azurewebsites.net/graphql';

export function apolloOptionsFactory(): ApolloClient.Options {
  const httpLink = inject(HttpLink);
  const cache = inject(APOLLO_CACHE);

  // Error link for centralized Apollo error handling
  // Based on Apollo Client 4.0 API:
  // https://the-guild.dev/graphql/apollo-angular/docs/data/error-handling
  // 
  // This ErrorLink handles Apollo-level errors and logs them.
  // Since errorPolicy is 'all', errors are still available to components.
  // Unhandled errors that escape components will be caught by GlobalErrorHandler.
  const errorLink = new ErrorLink(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      // GraphQL errors - errors returned from the server
      error.errors.forEach(({ message, locations, path }) => {
        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`, {
          operation: operation.operationName,
        });
      });
    } else if (CombinedProtocolErrors.is(error)) {
      // Protocol errors - errors in the GraphQL response protocol
      error.errors.forEach(({ message, extensions }) => {
        console.error(`[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`, {
          operation: operation.operationName,
        });
      });
    } else {
      // Network errors - connection issues, server errors, etc.
      console.error(`[Network error]: ${error}`, {
        operation: operation.operationName,
      });
    }
    
    // Note: We don't return anything here, which means:
    // - The error continues to propagate to the component
    // - Components can handle it via error handling in their queries
    // - If components don't handle it, GlobalErrorHandler will catch it
  });

  // Create the HTTP link
  const http = httpLink.create({
    uri,
    headers: new HttpHeaders().append('graphql-preflight', '1'),
  });

  return {
    link: ApolloLink.from([errorLink, http]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
    },
  };
}

const cache = new InMemoryCache({
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
    Question: {
      fields: {
        answers: relayStylePagination(),
      },
    },
  },
});

export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APOLLO_CACHE,
    useValue: cache,
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
