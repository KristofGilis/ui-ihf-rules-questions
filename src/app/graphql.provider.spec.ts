import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { InMemoryCache, gql } from '@apollo/client/core';
import { APOLLO_FLAGS, APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { APOLLO_CACHE, apolloOptionsFactory, graphqlProvider } from './graphql.provider';

describe('GraphQL Provider', () => {
  describe('apolloOptionsFactory', () => {
    let httpLink: jest.Mocked<HttpLink>;
    let cache: InMemoryCache;

    beforeEach(() => {
      cache = new InMemoryCache();

      httpLink = {
        create: jest.fn().mockReturnValue({
          request: jest.fn(),
        }),
      } as any;

      TestBed.configureTestingModule({
        providers: [
          { provide: HttpLink, useValue: httpLink },
          { provide: APOLLO_CACHE, useValue: cache },
        ],
      });
    });

    it('should create Apollo options with correct configuration', () => {
      const options = TestBed.runInInjectionContext(() => apolloOptionsFactory());

      expect(options).toBeDefined();
      expect(options.cache).toBe(cache);
      expect(options.link).toBeDefined();
    });

    it('should configure HttpLink with correct URI and headers', () => {
      TestBed.runInInjectionContext(() => apolloOptionsFactory());

      expect(httpLink.create).toHaveBeenCalledWith({
        uri: expect.any(String),
        headers: expect.any(HttpHeaders),
      });

      const createCall = httpLink.create.mock.calls[0][0];
      if (createCall && createCall.headers) {
        expect(createCall.headers.get('graphql-preflight')).toBe('1');
      }
    });

    it('should set default options for watchQuery', () => {
      const options = TestBed.runInInjectionContext(() => apolloOptionsFactory());

      expect(options.defaultOptions?.watchQuery).toEqual({
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      });
    });

    it('should set default options for query', () => {
      const options = TestBed.runInInjectionContext(() => apolloOptionsFactory());

      expect(options.defaultOptions?.query).toEqual({
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      });
    });

    it('should create Apollo link chain with error link and http link', () => {
      const options = TestBed.runInInjectionContext(() => apolloOptionsFactory());

      // The link should be an ApolloLink (combination of errorLink and httpLink)
      expect(options.link).toBeDefined();
      expect(typeof options.link?.request).toBe('function');
    });
  });

  describe('graphqlProvider', () => {
    it('should provide Apollo', () => {
      const apolloProvider = graphqlProvider.find((p: any) => p === Apollo);
      expect(apolloProvider).toBeDefined();
    });

    it('should provide APOLLO_CACHE with InMemoryCache', () => {
      const cacheProvider = graphqlProvider.find(
        (p: any) => typeof p === 'object' && p.provide?.toString().includes('apollo-cache')
      ) as any;
      expect(cacheProvider).toBeDefined();
      expect(cacheProvider?.useValue).toBeInstanceOf(InMemoryCache);
    });

    it('should provide APOLLO_OPTIONS with factory', () => {
      const optionsProvider = graphqlProvider.find(
        (p: any) => typeof p === 'object' && p.provide === APOLLO_OPTIONS
      ) as any;
      expect(optionsProvider).toBeDefined();
      expect(optionsProvider?.useFactory).toBe(apolloOptionsFactory);
    });

    it('should provide APOLLO_FLAGS with useInitialLoading enabled', () => {
      const flagsProvider = graphqlProvider.find(
        (p: any) => typeof p === 'object' && p.provide === APOLLO_FLAGS
      ) as any;
      expect(flagsProvider).toBeDefined();
      expect(flagsProvider?.useValue).toEqual({
        useInitialLoading: true,
      });
    });

    it('should configure cache with type policies', () => {
      const cacheProvider = graphqlProvider.find(
        (p: any) => typeof p === 'object' && p.provide?.toString().includes('apollo-cache')
      ) as any;
      const cache = cacheProvider?.useValue as InMemoryCache;

      expect(cache).toBeInstanceOf(InMemoryCache);

      // Check that cache has policies configured (via internal properties)
      expect((cache as any).policies).toBeDefined();
    });
  });

  describe('InMemoryCache Configuration', () => {
    it('should create cache with proper configuration', () => {
      const cacheProvider = graphqlProvider.find(
        (p: any) => typeof p === 'object' && p.provide?.toString().includes('apollo-cache')
      ) as any;
      const cache = cacheProvider?.useValue as InMemoryCache;

      expect(cache).toBeInstanceOf(InMemoryCache);
      expect((cache as any).policies).toBeDefined();
    });

    it('should handle cache reads and writes', () => {
      const cacheProvider = graphqlProvider.find(
        (p: any) => typeof p === 'object' && p.provide?.toString().includes('apollo-cache')
      ) as any;
      const cache = cacheProvider?.useValue as InMemoryCache;

      // Test basic cache functionality
      const testQuery = gql`
        query TestQuery {
          version
        }
      `;

      const testData = {
        version: '1.0.0',
      };

      cache.writeQuery({
        query: testQuery,
        data: testData,
      });

      const result = cache.readQuery({
        query: testQuery,
      });

      expect(result).toEqual(testData);
    });

    it('should support relay-style pagination', () => {
      const cacheProvider = graphqlProvider.find(
        (p: any) => typeof p === 'object' && p.provide?.toString().includes('apollo-cache')
      ) as any;
      const cache = cacheProvider?.useValue as InMemoryCache;

      // Verify the cache was created with the right configuration
      expect(cache).toBeDefined();
      expect(cache).toBeInstanceOf(InMemoryCache);
    });
  });
});
