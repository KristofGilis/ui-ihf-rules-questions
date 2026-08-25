import { inject, Service, signal } from '@angular/core';
import { catchError, defer, finalize, map, Observable, of, tap } from 'rxjs';
import { SearchQuestionsGQL } from '../../../../graphql/generated';
import { Question } from '../../../../graphql/types';
import { ConnectivityService } from '../../services/connectivity.service';
import { LocalSearchQuestionsService } from './local-search-questions.service';

interface SearchPage {
  nodes: Question[];
  endCursor: string | null;
  hasNextPage: boolean;
}

const PAGE_SIZE = 20;

@Service()
export class SearchQuestionsService {
  private readonly _searchQuestionsGQL = inject(SearchQuestionsGQL);
  private readonly _localSearch = inject(LocalSearchQuestionsService);
  private readonly _connectivity = inject(ConnectivityService);

  private _cursor: string | null = null;
  private _term = '';
  /** Full set of offline matches for the current term, computed once and then paginated like the online path. */
  private _localMatches: Question[] | null = null;
  private _localOffset = 0;

  readonly loading = signal(false);
  readonly hasNextPage = signal(false);
  readonly questions = signal<Question[]>([]);

  /** Starts a new search, replacing any existing results. Clears results for a blank term. */
  search(term: string): void {
    this._term = term.trim();
    this._cursor = null;
    this._localMatches = null;
    this._localOffset = 0;
    this.questions.set([]);
    this.hasNextPage.set(false);

    if (!this._term) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.fetchPage(false).subscribe();
  }

  fetchMore(): void {
    if (!this.hasNextPage() || this.loading()) return;
    this.loading.set(true);
    this.fetchPage(true).subscribe();
  }

  private fetchPage(append: boolean): Observable<void> {
    const term = this._term;

    // Local matches have no server-side cursor, so compute the (capped) full match list once per
    // term and then page through it in-memory using the same PAGE_SIZE as the online path.
    const local$ = (): Observable<SearchPage> => {
      const matches$ = this._localMatches ? of(this._localMatches) : this._localSearch.search(term);

      return matches$.pipe(
        tap((matches) => (this._localMatches = matches)),
        map((matches) => {
          const nodes = matches.slice(this._localOffset, this._localOffset + PAGE_SIZE);
          this._localOffset += nodes.length;
          return { nodes, endCursor: null, hasNextPage: this._localOffset < matches.length };
        })
      );
    };

    const remote$ = (): Observable<SearchPage> =>
      this._searchQuestionsGQL
        .fetch({
          variables: { searchTerm: term, first: PAGE_SIZE, after: this._cursor },
          fetchPolicy: 'network-only',
        })
        .pipe(
          map((result) => ({
            nodes: (result.data?.searchQuestions?.edges ?? []).map((e) => e.node as Question),
            endCursor: result.data?.searchQuestions?.pageInfo?.endCursor ?? null,
            hasNextPage: result.data?.searchQuestions?.pageInfo?.hasNextPage ?? false,
          })),
          // Network failure while "online" (e.g. flaky connection) still falls back to local data.
          catchError(() => local$())
        );

    return defer(() => (this._connectivity.online ? remote$() : local$())).pipe(
      tap((page) => {
        this._cursor = page.endCursor;
        this.hasNextPage.set(page.hasNextPage);
        this.questions.update((existing) => (append ? [...existing, ...page.nodes] : page.nodes));
      }),
      map(() => undefined),
      finalize(() => this.loading.set(false))
    );
  }
}
