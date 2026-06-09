import { computed, inject, Service, signal } from '@angular/core';
import {
  catchError,
  concatMap,
  defer,
  EMPTY,
  expand,
  finalize,
  from,
  map,
  Observable,
  of,
  reduce,
  switchMap,
  tap,
} from 'rxjs';
import {
  PrefetchAnswersGQL,
  PrefetchLanguagesGQL,
  PrefetchQuestionsGQL,
  PrefetchRulesGQL,
  PrefetchScoreConfigurationGQL,
  PrefetchVersionsGQL,
} from '../../../graphql/generated';
import { SCHEMA_VERSION } from '../../version';
import { APOLLO_CACHE, APOLLO_PERSISTOR } from '../graphql.provider';
import { ConnectivityService } from './connectivity.service';

export type OfflineSyncStatus = 'idle' | 'restoring' | 'checking' | 'prefetching' | 'up-to-date' | 'offline' | 'error';

const VERSIONS_STORAGE_KEY = 'ihf:offline:versions';
const LAST_SYNC_STORAGE_KEY = 'ihf:offline:lastSync';
const SCHEMA_VERSION_STORAGE_KEY = 'ihf:offline:schemaVersion';
const CACHE_FORMAT_VERSION_STORAGE_KEY = 'ihf:offline:cacheFormatVersion';

/**
 * Bump this whenever the shape of the persisted Apollo cache changes in a way
 * that requires existing users to wipe their IndexedDB cache on next load
 * (e.g. typePolicy changes, new merge strategies, fixes for bogus cached
 * connection slots written by a previous buggy build).
 *
 * On boot, if the stored value does not match this constant, the entire
 * persisted cache + in-memory cache + manifest are purged before resync.
 */
const CACHE_FORMAT_VERSION = '2';

/** Entity buckets driven by `prefetchVersions`. */
type Entity = 'rules' | 'questions' | 'answers' | 'languages' | 'scoreConfiguration';

const ALL_ENTITIES: readonly Entity[] = ['rules', 'questions', 'answers', 'languages', 'scoreConfiguration'] as const;

type VersionsManifest = Partial<Record<string, unknown>>;

interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

@Service()
export class OfflineDataService {
  private readonly _persistor = inject(APOLLO_PERSISTOR);
  private readonly _cache = inject(APOLLO_CACHE);
  private readonly _connectivity = inject(ConnectivityService);
  private readonly _versions = inject(PrefetchVersionsGQL);
  private readonly _rules = inject(PrefetchRulesGQL);
  private readonly _questions = inject(PrefetchQuestionsGQL);
  private readonly _answers = inject(PrefetchAnswersGQL);
  private readonly _languages = inject(PrefetchLanguagesGQL);
  private readonly _scoreConfig = inject(PrefetchScoreConfigurationGQL);

  readonly status = signal<OfflineSyncStatus>('idle');
  readonly progress = signal<{ done: number; total: number }>({ done: 0, total: 0 });
  readonly lastSyncedAt = signal<string | null>(this.readLastSync());
  readonly busy = computed(() => {
    const s = this.status();
    return s === 'restoring' || s === 'checking' || s === 'prefetching';
  });

  /** Called from `provideAppInitializer`. Non-blocking. */
  initialize(): Observable<void> {
    return this.runSync('initial');
  }

  /**
   * Explicit user-triggered refresh (button in AppComponent).
   *
   * Always wipes the persisted IndexedDB cache and in-memory Apollo cache
   * first, then runs a full resync from the server. This guarantees no stale
   * normalized records survive (e.g. bogus connection slots from a previous
   * buggy build). No-op when offline.
   */
  refresh(): Observable<void> {
    return defer(() => {
      if (!this._connectivity.online) {
        this.status.set('offline');
        return of(undefined);
      }
      this.status.set('restoring');
      return from(this._persistor.purge()).pipe(
        catchError((err) => {
          console.error('[offline-data] refresh purge failed:', err);
          return of(undefined);
        }),
        switchMap(() => from(this._cache.reset())),
        catchError((err) => {
          console.error('[offline-data] refresh cache reset failed:', err);
          return of(undefined);
        }),
        tap(() => {
          localStorage.removeItem(VERSIONS_STORAGE_KEY);
          localStorage.removeItem(LAST_SYNC_STORAGE_KEY);
          localStorage.removeItem(SCHEMA_VERSION_STORAGE_KEY);
          this.lastSyncedAt.set(null);
        }),
        switchMap(() => this.runSync('refresh'))
      );
    });
  }

  /** Wipe the persisted cache + manifest (e.g. on logout / settings reset). */
  clear(): Observable<void> {
    return from(this._persistor.purge()).pipe(
      tap(() => {
        localStorage.removeItem(VERSIONS_STORAGE_KEY);
        localStorage.removeItem(LAST_SYNC_STORAGE_KEY);
        localStorage.removeItem(SCHEMA_VERSION_STORAGE_KEY);
        this.lastSyncedAt.set(null);
        this.status.set('idle');
      }),
      map(() => undefined)
    );
  }

  private runSync(kind: 'initial' | 'refresh'): Observable<void> {
    return defer(() => {
      this.status.set('checking');
      if (!this._connectivity.online) {
        this.status.set('offline');
        return of(undefined);
      }
      // One-shot auto-reset for existing users: when the cache format version
      // bumps, wipe persisted IndexedDB + in-memory cache + manifest before
      // resyncing so stale shapes from a previous build cannot leak through.
      const formatReset$ = this.readCacheFormatVersion() !== CACHE_FORMAT_VERSION ? this.purgeAll() : of(undefined);
      return formatReset$.pipe(
        switchMap(() => this.syncFromServer()),
        catchError((err) => {
          console.error(`[offline-data] ${kind} sync failed:`, err);
          this.status.set('error');
          return of(undefined);
        })
      );
    });
  }

  private purgeAll(): Observable<void> {
    return from(this._persistor.purge()).pipe(
      catchError((err) => {
        console.error('[offline-data] auto-reset purge failed:', err);
        return of(undefined);
      }),
      switchMap(() => from(this._cache.reset())),
      catchError((err) => {
        console.error('[offline-data] auto-reset cache reset failed:', err);
        return of(undefined);
      }),
      tap(() => {
        localStorage.removeItem(VERSIONS_STORAGE_KEY);
        localStorage.removeItem(LAST_SYNC_STORAGE_KEY);
        localStorage.removeItem(SCHEMA_VERSION_STORAGE_KEY);
        this.lastSyncedAt.set(null);
      }),
      map(() => undefined)
    );
  }

  private syncFromServer(): Observable<void> {
    return this.fetchServerVersions().pipe(
      switchMap((serverVersions) => {
        const localVersions = this.readVersions();
        const cacheEmpty = this.isCacheEmpty();
        const isFirstRun = Object.keys(localVersions).length === 0 || cacheEmpty;
        // Server returns one global versions payload (keyed by language, not
        // entity). Treat the whole blob as a single signature: if it changed,
        // every entity is considered stale.
        const manifestChanged = !deepEqual(localVersions, serverVersions);
        // When the app version changes the GraphQL schema may have changed too;
        // force a full resync so stale cached data never causes type mismatches.
        const schemaChanged = this.readSchemaVersion() !== SCHEMA_VERSION;

        const changed: Entity[] = isFirstRun || manifestChanged || schemaChanged ? [...ALL_ENTITIES] : [];

        if (changed.length === 0) {
          this.writeSchemaVersion();
          this.writeCacheFormatVersion();
          this.status.set('up-to-date');
          this.touchLastSync();
          return of(undefined);
        }

        this.status.set('prefetching');
        this.progress.set({ done: 0, total: changed.length });

        // Prefetch sequentially so we can track per-entity progress and avoid
        // hammering the backend with parallel large queries.
        return from(changed).pipe(
          concatMap((entity) =>
            defer(() => {
              this.evictEntity(entity);
              return this.prefetchEntity(entity);
            }).pipe(
              catchError((err) => {
                console.error(`[offline-data] failed to prefetch ${entity}:`, err);
                return of(undefined);
              }),
              finalize(() => this.progress.update((p) => ({ ...p, done: p.done + 1 })))
            )
          ),
          reduce<void, void>(() => undefined, undefined),
          switchMap(() => {
            this.writeVersions(serverVersions);
            this.writeSchemaVersion();
            this.writeCacheFormatVersion();
            this.touchLastSync();
            return from(this._persistor.persist()).pipe(
              catchError((err) => {
                console.error('[offline-data] persist failed:', err);
                return of(undefined);
              }),
              tap(() => this.status.set('up-to-date')),
              map(() => undefined)
            );
          })
        );
      })
    );
  }

  private fetchServerVersions(): Observable<VersionsManifest> {
    return this._versions
      .fetch({ fetchPolicy: 'network-only', context: { requireNetwork: true } })
      .pipe(map((result) => normalizeVersionsPayload(result.data?.versions)));
  }

  private evictEntity(entity: Entity): void {
    this._cache.evict({ fieldName: entity });
    this._cache.gc();
  }

  /**
   * Returns true when the normalized cache contains no entity records for any
   * of the bulk-prefetched entities. Used as a self-healing trigger: if the
   * manifest claims data is up to date but the cache is actually empty
   * (purge, fresh install, storage clear), force a full prefetch.
   */
  private isCacheEmpty(): boolean {
    try {
      const snapshot = this._cache.extract() as Record<string, unknown>;
      for (const key of Object.keys(snapshot)) {
        if (key.startsWith('Rule:') || key.startsWith('Question:') || key.startsWith('Answer:')) {
          return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  }

  private prefetchEntity(entity: Entity): Observable<void> {
    switch (entity) {
      case 'rules':
        return this.paginate((cursor) =>
          this._rules.fetch({ variables: { cursor }, fetchPolicy: 'network-only' }).pipe(
            map((r) => ({
              endCursor: r.data?.rules?.pageInfo?.endCursor ?? null,
              hasNextPage: r.data?.rules?.pageInfo?.hasNextPage ?? false,
            }))
          )
        );
      case 'questions':
        return this.paginate((cursor) =>
          this._questions.fetch({ variables: { cursor }, fetchPolicy: 'network-only' }).pipe(
            map((r) => ({
              endCursor: r.data?.questions?.pageInfo?.endCursor ?? null,
              hasNextPage: r.data?.questions?.pageInfo?.hasNextPage ?? false,
            }))
          )
        );
      case 'answers':
        return this.paginate((cursor) =>
          this._answers.fetch({ variables: { cursor }, fetchPolicy: 'network-only' }).pipe(
            map((r) => ({
              endCursor: r.data?.answers?.pageInfo?.endCursor ?? null,
              hasNextPage: r.data?.answers?.pageInfo?.hasNextPage ?? false,
            }))
          )
        );
      case 'languages':
        return this._languages.fetch({ fetchPolicy: 'network-only' }).pipe(map(() => undefined));
      case 'scoreConfiguration':
        return this._scoreConfig.fetch({ fetchPolicy: 'network-only' }).pipe(map(() => undefined));
    }
  }

  private paginate(page: (cursor: string | null) => Observable<PageInfo>): Observable<void> {
    return page(null).pipe(
      expand((p) => (p.hasNextPage && p.endCursor ? page(p.endCursor) : EMPTY)),
      reduce<PageInfo, void>(() => undefined, undefined)
    );
  }

  private readVersions(): VersionsManifest {
    try {
      const raw = localStorage.getItem(VERSIONS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as VersionsManifest) : {};
    } catch {
      return {};
    }
  }

  private writeVersions(manifest: VersionsManifest): void {
    try {
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(manifest));
    } catch (err) {
      console.error('[offline-data] failed to persist versions manifest:', err);
    }
  }

  private readSchemaVersion(): string | null {
    try {
      return localStorage.getItem(SCHEMA_VERSION_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private writeSchemaVersion(): void {
    try {
      localStorage.setItem(SCHEMA_VERSION_STORAGE_KEY, SCHEMA_VERSION);
    } catch {
      /* ignore */
    }
  }

  private readCacheFormatVersion(): string | null {
    try {
      return localStorage.getItem(CACHE_FORMAT_VERSION_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private writeCacheFormatVersion(): void {
    try {
      localStorage.setItem(CACHE_FORMAT_VERSION_STORAGE_KEY, CACHE_FORMAT_VERSION);
    } catch {
      /* ignore */
    }
  }

  private readLastSync(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private touchLastSync(): void {
    const stamp = new Date().toISOString();
    try {
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, stamp);
    } catch {
      /* ignore */
    }
    this.lastSyncedAt.set(stamp);
  }
}

/**
 * Normalize the `versions` scalar (returned as `unknown` JSON) into a flat
 * map keyed by entity name. Supports both object-shaped payloads
 * (`{ rules: 'hash', ... }`) and array shapes
 * (`[{ name: 'rules', hash: '...' }, ...]`).
 */
function normalizeVersionsPayload(raw: unknown): VersionsManifest {
  if (raw == null) return {};
  if (Array.isArray(raw)) {
    const out: VersionsManifest = {};
    for (const item of raw) {
      if (item && typeof item === 'object') {
        const entry = item as Record<string, unknown>;
        const name = (entry['name'] ?? entry['entity'] ?? entry['key']) as string | undefined;
        const value = entry['hash'] ?? entry['version'] ?? entry['value'] ?? entry;
        if (name) out[name] = value;
      }
    }
    return out;
  }
  if (typeof raw === 'object') return { ...(raw as VersionsManifest) };
  return { _: raw };
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
