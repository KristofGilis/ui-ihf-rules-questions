import { inject, Injectable } from '@angular/core';
import { ObservableQuery } from '@apollo/client/core';
import { catchError, debounceTime, defer, map, Observable, Subject, switchMap, tap } from 'rxjs';
import {
  CalculateScoreGQL,
  CalculateScoreQuery,
  GetQuestionsGQL,
  QuestionSortInput,
} from '../../../../graphql/generated';
import { LocalScoreService } from '../../quiz/services/local-score.service';
import { ConnectivityService } from '../../services/connectivity.service';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private _cursor: string | null = null;
  private _hasNextPage = true;

  private readonly _order: QuestionSortInput[] = [{ number: 'ASC' }];
  private readonly _pageSize = 10;
  private readonly _getQuestionsGQL = inject(GetQuestionsGQL);
  private readonly _questionsQuery = this._getQuestionsGQL.watch({
    variables: {
      first: this._pageSize,
      after: this._cursor,
      order: this._order,
      random: false,
    },
    notifyOnNetworkStatusChange: true,
    refetchWritePolicy: 'overwrite',
    nextFetchPolicy: 'cache-first',
  });
  private readonly _calculateScoreGQL = inject(CalculateScoreGQL);
  private readonly _localScore = inject(LocalScoreService);
  private readonly _connectivity = inject(ConnectivityService);

  // Debounced score calculation to prevent rapid-fire requests
  private readonly _scoreSubject = new Subject<{ questionIds: string[]; selectedAnswerIds: string[] }>();
  readonly debouncedScore$ = this._scoreSubject.pipe(
    debounceTime(300),
    switchMap(({ questionIds, selectedAnswerIds }) => this.calculateScore(questionIds, selectedAnswerIds))
  );

  get hasNextPage(): boolean {
    return this._hasNextPage;
  }

  readonly questions$ = this._questionsQuery.valueChanges.pipe(
    tap((x) => {
      this._cursor = x.data?.questions?.pageInfo?.endCursor ?? null;
      this._hasNextPage = x.data?.questions?.pageInfo?.hasNextPage ?? true;
    })
  );

  refetch(): void {
    this._cursor = null;
    this._questionsQuery.refetch({
      first: this._pageSize,
      after: this._cursor,
      order: this._order,
      random: false,
    });
  }

  fetchMore(): void {
    if (this._hasNextPage && this._connectivity.online) {
      this._questionsQuery.fetchMore({
        variables: {
          after: this._cursor,
        },
      });
    }
  }

  calculateScore(
    questionIds: string[],
    selectedAnswerIds: string[]
  ): Observable<ObservableQuery.Result<CalculateScoreQuery>> {
    // Branch on connectivity: when offline (or the network call fails)
    // compute the score locally from the prefetched cache so /rule/:id and
    // /questions still show a score without a server round-trip. Emit the
    // result with `dataState: 'complete'` so apollo-angular's
    // `onlyCompleteData()` operator passes it through.
    const local$ = (): Observable<ObservableQuery.Result<CalculateScoreQuery>> =>
      this._localScore.calculateScore(questionIds, selectedAnswerIds).pipe(
        map(
          (score) =>
            ({
              loading: false,
              dataState: 'complete',
              data: { calculateScore: score } as CalculateScoreQuery,
            }) as unknown as ObservableQuery.Result<CalculateScoreQuery>
        )
      );

    return defer(() =>
      this._connectivity.online
        ? this._calculateScoreGQL
            .watch({
              variables: { questionIds, selectedAnswerIds },
              fetchPolicy: 'no-cache',
            })
            .valueChanges.pipe(catchError(() => local$()))
        : local$()
    );
  }

  /**
   * Trigger debounced score calculation
   * Use this instead of calculateScore() for real-time updates
   */
  requestScore(questionIds: string[], selectedAnswerIds: string[]): void {
    this._scoreSubject.next({ questionIds, selectedAnswerIds });
  }
}
