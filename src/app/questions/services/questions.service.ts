import { Injectable, inject } from '@angular/core';
import { ObservableQuery } from '@apollo/client/core';
import { Observable, tap } from 'rxjs';
import {
  CalculateScoreGQL,
  CalculateScoreQuery,
  GetQuestionsGQL,
  QuestionSortInput,
  SortEnumType,
} from '../../../../graphql/generated';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private _cursor: string | null = null;
  private _hasNextPage = true;

  private readonly _order: QuestionSortInput[] = [{ number: SortEnumType.Asc }];
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
    nextFetchPolicy: 'network-only',
  });
  private readonly _calculateScoreGQL = inject(CalculateScoreGQL);

  get hasNextPage(): boolean {
    return this._hasNextPage;
  }

  questions$ = this._questionsQuery.valueChanges.pipe(
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
    if (this._hasNextPage) {
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
    return this._calculateScoreGQL.watch({
      variables: {
        questionIds,
        selectedAnswerIds,
      },
      fetchPolicy: 'no-cache',
    }).valueChanges;
  }
}
