import { HttpHeaders } from '@angular/common/http';
import { ApplicationConfig, inject, InjectionToken, isDevMode } from '@angular/core';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';
import { Apollo, APOLLO_FLAGS, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { CachePersistor, LocalForageWrapper } from 'apollo4-cache-persist';
import localforage from 'localforage';
import { catchError, defer, from, map, Observable, of } from 'rxjs';
import { environment } from '../environments/environment';

export const APOLLO_CACHE = new InjectionToken<InMemoryCache>('apollo-cache');
export const APOLLO_PERSISTOR = new InjectionToken<CachePersistor>('apollo-persistor');

// Singleton cache + persistor instances. Created at module load so they can be
// awaited (restored) inside provideAppInitializer before Apollo runs any query.
const ruleQuestionsPagination = relayStylePagination();
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        rules: relayStylePagination(),
        questions: relayStylePagination(['order', 'random']),
        answers: relayStylePagination(),
        ruleById: {
          // Cache redirect: resolve `ruleById(id)` from a normalized Rule entity
          // already populated via the `rules` connection prefetch. Required for
          // the rule-detail page to render fully offline.
          read(_existing, { args, toReference }) {
            const id = args?.['id'];
            if (id == null) return undefined;
            return toReference({ __typename: 'Rule', id: id as string });
          },
        },
      },
    },
    Rule: {
      fields: {
        questions: {
          ...ruleQuestionsPagination,
          read(existing, options) {
            // If we already have a fetched/merged Rule.questions connection
            // (online path wrote it), delegate to the relay pagination read.
            const merged = existing as { edges?: unknown[] } | undefined;
            if (merged?.edges?.length) {
              return ruleQuestionsPagination.read?.(existing, options) ?? existing;
            }

            // Offline-first fallback: synthesize the *complete* connection for
            // this rule from the flat root `questions` list that
            // prefetchQuestions populated. We intentionally ignore the
            // `first` / `after` args and return all edges with
            // `hasNextPage: false` so the UI never triggers `fetchMore`
            // against synthesized data. The cursors in `Query.questions` are
            // global and not valid as `after` for `Rule.questions`, so a
            // server-side `fetchMore` here would either duplicate or skip
            // pages. Rendering all questions at once is acceptable because
            // the Question entities are already normalized in the cache.
            const { readField } = options;
            const ruleId = readField<string>('id');
            if (!ruleId) return undefined;

            const rootQuestions = readField<{
              edges?: readonly { cursor: string; node: { __ref?: string } }[];
            }>({
              fieldName: 'questions',
              args: { order: [{ number: 'ASC' }], random: false },
              from: { __ref: 'ROOT_QUERY' },
            });

            const allEdges = rootQuestions?.edges;
            if (!allEdges?.length) return undefined;

            const filtered = allEdges.filter((edge) => readField<string>('ruleId', edge.node) === ruleId);
            if (!filtered.length) return undefined;

            return {
              __typename: 'QuestionsConnection',
              edges: filtered,
              pageInfo: {
                __typename: 'PageInfo',
                startCursor: filtered[0]?.cursor ?? null,
                endCursor: filtered[filtered.length - 1]?.cursor ?? null,
                hasNextPage: false,
                hasPreviousPage: false,
              },
            };
          },
        },
      },
    },
    Question: {
      fields: {
        answers: relayStylePagination(),
      },
    },
  },
});

const storage = localforage.createInstance({
  name: 'ihf-apollo',
  storeName: 'apollo-cache',
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  description: 'Apollo Client cache for offline support',
});

const persistor = new CachePersistor({
  cache,
  storage: new LocalForageWrapper(storage),
  maxSize: 15 * 1024 * 1024, // 15 MiB
  debug: isDevMode(),
  trigger: 'write',
});

/**
 * Emitted (and completed) once the persisted cache has been restored so that
 * subsequent queries see the hydrated cache. Used inside
 * `provideAppInitializer` — Angular will wait for the observable to complete
 * before bootstrapping the app.
 */
export function restoreApolloCache(): Observable<void> {
  return defer(() => from(persistor.restore())).pipe(
    map(() => undefined),
    catchError((error) => {
      console.error('[apollo-cache-persist] Failed to restore cache:', error);
      return of(undefined);
    })
  );
}

export function apolloOptionsFactory(): ApolloClient.Options {
  const httpLink = inject(HttpLink);
  const cacheRef = inject(APOLLO_CACHE);

  // ErrorLink for centralized logging of GraphQL / network / protocol errors.
  const errorLink = new ErrorLink(({ error, operation }) => {
    if (!isDevMode()) return;

    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, locations, path }) => {
        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`, {
          operation: operation.operationName,
        });
      });
    } else if (CombinedProtocolErrors.is(error)) {
      error.errors.forEach(({ message, extensions }) => {
        console.error(`[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`, {
          operation: operation.operationName,
        });
      });
    } else {
      console.error(`[Network error]: ${error}`, { operation: operation.operationName });
    }
  });

  const http = httpLink.create({
    uri: environment.apiUrl,
    headers: new HttpHeaders().append('graphql-preflight', '1'),
  });

  return {
    link: ApolloLink.from([errorLink, http]),
    cache: cacheRef,
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-first' },
      query: { fetchPolicy: 'cache-first' },
    },
  };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  { provide: APOLLO_CACHE, useValue: cache },
  { provide: APOLLO_PERSISTOR, useValue: persistor },
  { provide: APOLLO_OPTIONS, useFactory: apolloOptionsFactory },
  {
    provide: APOLLO_FLAGS,
    useValue: { useInitialLoading: true },
  },
];
